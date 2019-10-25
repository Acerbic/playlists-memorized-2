import request from "supertest";
import { Express } from "express";
import jwt from "jsonwebtoken";
import {
    AuthorizedGoogleSession,
    AnonymousSession,
    sign_session,
} from "../../session";
import {
    add_new_user,
    get_user,
    reset_users_storage,
    UserRecordGoogle,
} from "../../storage";

const real_googleapis = jest.requireActual("googleapis");
type GAPI_OAuth2 = typeof real_googleapis.google.auth.OAuth2;

const mockGapiOAuth2On = jest.fn();
const mockGapiOAuth2GetTokenInfo = jest.fn();
const mockGapiOAuth2SetCredentials = jest.fn();
const mockGapiOAuth2GetAccessToken = jest.fn();

jest.mock("googleapis", () => ({
    google: {
        auth: {
            OAuth2: jest
                .fn()
                // mock constructor implementation that will produce a mocked instance
                .mockImplementation(function(this: GAPI_OAuth2, ...args) {
                    // call actual constructor code
                    const instance = new real_googleapis.google.auth.OAuth2(
                        ...args
                    );

                    // spy/mock methods
                    instance.original_on = instance.on;
                    instance.original_getTokenInfo = instance.getTokenInfo;
                    instance.original_setCredentials = instance.setCredentials;
                    instance.original_getAccessToken = instance.getAccessToken;

                    // defaults implementations to original behavior (like spyOn)
                    instance.on = mockGapiOAuth2On.mockImplementation(
                        instance.original_on
                    );
                    instance.getTokenInfo = mockGapiOAuth2GetTokenInfo.mockImplementation(
                        instance.original_getTokenInfo
                    );
                    instance.setCredentials = mockGapiOAuth2SetCredentials.mockImplementation(
                        instance.original_setCredentials
                    );
                    instance.getAccessToken = mockGapiOAuth2GetAccessToken.mockImplementation(
                        instance.original_getAccessToken
                    );

                    // return mocked instance
                    return instance;
                }),
        },
    },
}));

import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import makeApp from "../../app";
import { ValidateSessionResponseBody } from "../validate_session";
import { mock_user_profile } from "../../__tests__/_utils";

describe("route /validate_session", () => {
    let app: Express;

    const VALIDATE_SESSION_ENDPOINT = "/validate_session";

    beforeAll(() => {
        // instantiate app
        app = makeApp();
    });

    beforeEach(() => {
        mockGapiOAuth2On.mockClear();
        mockGapiOAuth2GetTokenInfo.mockClear();
        mockGapiOAuth2SetCredentials.mockClear();
        mockGapiOAuth2GetAccessToken.mockClear();

        reset_users_storage();
    });

    it("should not respond to GET method", () =>
        request(app)
            .get(VALIDATE_SESSION_ENDPOINT)
            .expect(404));

    it("should contain proper token argument", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .expect(401));
    it("should contain proper token argument 3", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer ")
            .expect(401));
    it("should contain proper token argument 4", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer " + "some value")
            .expect(401));

    it("should fail on unknown token", () => {
        const token: AnonymousSession = {
            type: "anonymous",
            userId: "unknown-user",
        };

        const encoded = jwt.sign(token, process.env.JWT_SECRET!);
        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer " + encoded)
            .then(res => expect(res.ok).toBe(false));
    });

    it("should confirm a valid token", async () => {
        const userId = await add_new_user({
            type: "google",
            googleUserId: "999888qwerty",
            profile: { id: "999888qwerty" } as any,
            accessToken: "123",
            refreshToken: "456",
        });
        const token: AuthorizedGoogleSession = {
            type: "google",
            userId: userId,
            userGoogleId: "1234567",
            profile: { id: "1234567" } as any,
        };

        mockGapiOAuth2GetTokenInfo.mockResolvedValueOnce({
            expiry_date: (new Date().getTime() + 60 * 60) * 1000,
        });
        mockGapiOAuth2GetAccessToken.mockResolvedValueOnce({
            token: "123",
        });

        const encoded = await sign_session(token);
        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer " + encoded)
            .then(res => {
                expect(res.ok).toBe(true);
                expect(res.body as ValidateSessionResponseBody).toStrictEqual({
                    success: true,
                });
            });
    });

    it("should refresh valid token if outdated", async () => {
        const userId = await add_new_user({
            type: "google",
            googleUserId: "115443689538608998788",
            profile: {
                id: "115443689538608998788",
                provider: "google",
                displayName: "Some User",
            } as any,
            accessToken: "outdated_invalid_token",
            // "ya29.Il-pBzdEMsR9fP9aLPCvghEa-c9HrEAud1eaIKCxt7thVDBazH5-WyHR3Pa7NLXwvRkxMyVDVdF9BF6wOuaZvWEM_lOicgWeZlITpo1v2ErkmjdxRhZ6fAvFfBPYG-Fmag",
            refreshToken:
                "1//0cfVYhE34u2F_CgYIARAAGAwSNwF-L9IriPaIdAiZxrcwrcDl6fXR82h0niDXyySCzDP766vepTAkPRmWF6PT7D00uZ8JTQJPcOs",
        });
        const token: AuthorizedGoogleSession = {
            type: "google",
            userId: userId,
            userGoogleId: "115443689538608998788",
            profile: { id: "115443689538608998788" } as any,
        };

        const encoded = await sign_session(token);

        // simulate failing token validation
        mockGapiOAuth2GetTokenInfo.mockImplementationOnce(async () => {
            throw new Error("invalid_token");
        });
        mockGapiOAuth2GetAccessToken.mockImplementationOnce(async function(
            this: OAuth2Client
        ) {
            this.emit("tokens", { access_token: "new access token" });
            return { token: "new access token" };
        });

        let user = await get_user(userId);

        expect((user as UserRecordGoogle).accessToken).toBe(
            "outdated_invalid_token"
        );

        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer " + encoded)
            .then(async res => {
                const gapi_client_constructor: jest.MockedClass<
                    typeof OAuth2Client
                > = google.auth.OAuth2 as any;
                expect(gapi_client_constructor).toBeCalledTimes(1);
                expect(gapi_client_constructor).toReturn();

                const gapi_client_instance: jest.Mocked<OAuth2Client> =
                    gapi_client_constructor.mock.results[0].value;
                expect(gapi_client_instance.getTokenInfo).toBeCalledTimes(1);
                expect(gapi_client_instance.getTokenInfo).toReturn();
                expect(
                    gapi_client_instance.getTokenInfo.mock.results[0].value
                ).rejects.toThrow("invalid_token");

                expect(gapi_client_instance.getAccessToken).toBeCalledTimes(1);

                user = await get_user(userId);
                expect((user as UserRecordGoogle).accessToken).not.toBe(
                    "outdated_invalid_token"
                );

                expect(res.ok).toBe(true);
                expect(res.body as ValidateSessionResponseBody).toStrictEqual({
                    success: true,
                });
            });
    });

    it("should return an error code if access token invalid and refresh failed", async () => {
        const userId = await add_new_user({
            type: "google",
            googleUserId: mock_user_profile.id,
            profile: mock_user_profile,
            accessToken: "outdated_invalid_token",
            // "ya29.Il-pBzdEMsR9fP9aLPCvghEa-c9HrEAud1eaIKCxt7thVDBazH5-WyHR3Pa7NLXwvRkxMyVDVdF9BF6wOuaZvWEM_lOicgWeZlITpo1v2ErkmjdxRhZ6fAvFfBPYG-Fmag",
            refreshToken: "bad_refresh_token",
            // "1//0cfVYhE34u2F_CgYIARAAGAwSNwF-L9IriPaIdAiZxrcwrcDl6fXR82h0niDXyySCzDP766vepTAkPRmWF6PT7D00uZ8JTQJPcOs",
        });
        const token: AuthorizedGoogleSession = {
            type: "google",
            userId: userId,
            userGoogleId: mock_user_profile.id,
            profile: mock_user_profile,
        };

        const encoded = await sign_session(token);

        // simulate failing token validation
        mockGapiOAuth2GetTokenInfo.mockRejectedValueOnce(
            new Error("invalid_token")
        );
        mockGapiOAuth2GetAccessToken.mockRejectedValueOnce(
            new Error("invalid_token")
        );

        const res = await request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer " + encoded);

        const gapi_client_constructor: jest.MockedClass<
            typeof OAuth2Client
        > = google.auth.OAuth2 as any;
        expect(gapi_client_constructor).toBeCalledTimes(1);
        expect(gapi_client_constructor).toReturn();

        const gapi_client_instance: jest.Mocked<OAuth2Client> =
            gapi_client_constructor.mock.results[0].value;

        expect(gapi_client_instance.getTokenInfo).toBeCalledTimes(1);
        expect(gapi_client_instance.getAccessToken).toBeCalledTimes(1);

        expect(res.status).toBe(400);
        expect(res.body as ValidateSessionResponseBody).toHaveProperty(
            "success"
        );
        expect((res.body as ValidateSessionResponseBody).success).toBe(false);
    });
});
