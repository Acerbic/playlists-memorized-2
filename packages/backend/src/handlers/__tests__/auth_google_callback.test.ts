import request from "supertest";
import { oauth2tokenCallback } from "oauth";
import { Profile } from "passport-google-oauth20";

import {
    mock_PassportInitialize,
    mock_PassportGoogleOauth,
    unmock_PassportGoogleOauth,
} from "../../__tests__/_utils";
const mockVerify = mock_PassportInitialize(); // must be executed before `import makeApp`

import makeApp from "../../app";
const app = makeApp();

import { reset_users_storage, find_google_user } from "../../storage";
const { verify: originalVerify } = jest.requireActual("../../passport");

// reusable template of profile
const mock_user_profile: Profile = {
    id: "some id",
    provider: "google",
    profileUrl: "",
    _json: "",
    _raw: "",
    displayName: "Mock User",
};

describe("route /auth/google/callback", () => {
    beforeEach(reset_users_storage);
    it("should redirect to google login screen without args", () =>
        request(app)
            .get("/auth/google/callback")
            .expect(302)
            .expect("Location", /^https:\/\/accounts\.google\.com/));

    it("should redirect to login finish page error", () =>
        request(app)
            .get("/auth/google/callback")
            .query({ error: "access_denied" })
            .expect(302)
            .expect("Location", "/login"));

    it("should redirect to login finish page on success", () => {
        const mocks = mock_PassportGoogleOauth();
        mockVerify.mockImplementationOnce(
            (access_token, refresh_token, profile, done): any =>
                done(undefined, "mock-usr-id")
        );
        mocks.mockGetOAuthAccessToken.mockImplementationOnce(
            (
                code: string,
                params: any,
                callback: oauth2tokenCallback
            ): void => {
                callback(
                    null as any,
                    "mock_access_token",
                    "mock_refresh_token",
                    {}
                );
            }
        );
        mocks.mockLoadUserProfile.mockImplementationOnce(
            (
                access_token: string,
                cb: (err: any, profile: any) => void
            ): void => {
                cb(null, { profile: "mock_profile" });
            }
        );

        return request(app)
            .get("/auth/google/callback")
            .query({
                code:
                    "4/sAEZzb8MDIBoTTFTyZiRJaB5bBysCQC0zBdrAqwu-KtK3XtsalBUH_ZgWiTz4_tHb19lJI8bOgVYA04WfIiFuHc",
                scope:
                    "profile https://www.googleapis.com/auth/userinfo.profile",
                state: JSON.stringify({
                    destination: "http://localhost:3000/google_auth",
                }),
            })
            .expect(302)
            .expect("Location", "http://localhost:3000/google_auth")
            .then(() => {
                expect(mocks.mockGetOAuthAccessToken.mock.calls.length).toEqual(
                    1
                );
                expect(mocks.mockLoadUserProfile.mock.calls.length).toEqual(1);
                expect(mockVerify.mock.calls.length).toEqual(1);
                expect(mockVerify.mock.calls[0][2]).toStrictEqual({
                    profile: "mock_profile",
                });
            })
            .finally(() => {
                unmock_PassportGoogleOauth(mocks);
                mockVerify.mockClear();
            });
    });

    it("should create user account if there's no user for this login", async () => {
        const mock_user_profile: Profile = {
            id: "some id",
            provider: "google",
            profileUrl: "",
            _json: "",
            _raw: "",
            displayName: "Mock User",
        };

        const mocks = mock_PassportGoogleOauth();
        mockVerify.mockImplementation(originalVerify);

        mocks.mockGetOAuthAccessToken.mockImplementationOnce(
            (
                code: string,
                params: any,
                callback: oauth2tokenCallback
            ): void => {
                callback(
                    null as any,
                    "mock_access_token",
                    "mock_refresh_token",
                    {}
                );
            }
        );
        mocks.mockLoadUserProfile.mockImplementationOnce(
            (
                access_token: string,
                cb: (err: any, profile: any) => void
            ): void => {
                cb(null, mock_user_profile);
            }
        );

        expect(find_google_user(mock_user_profile)).resolves.toBeUndefined();
        try {
            const res = await request(app)
                .get("/auth/google/callback")
                .query({
                    code:
                        "4/sAEZzb8MDIBoTTFTyZiRJaB5bBysCQC0zBdrAqwu-KtK3XtsalBUH_ZgWiTz4_tHb19lJI8bOgVYA04WfIiFuHc",
                    scope:
                        "profile https://www.googleapis.com/auth/userinfo.profile",
                    state: JSON.stringify({
                        destination: "http://localhost:3000/google_auth",
                    }),
                })
                .expect(302);
            expect(
                find_google_user(mock_user_profile)
            ).resolves.not.toBeUndefined();
        } finally {
            unmock_PassportGoogleOauth(mocks);
            mockVerify.mockClear();
        }
    });
    it.todo("should fetch existing account if the login is for existing user");
    it("should fail if missing redirect data", async () => {
        const mocks = mock_PassportGoogleOauth();
        mockVerify.mockImplementationOnce(
            (access_token, refresh_token, profile, done): any =>
                done(undefined, "mock-usr-id")
        );
        mocks.mockGetOAuthAccessToken.mockImplementationOnce(
            (
                code: string,
                params: any,
                callback: oauth2tokenCallback
            ): void => {
                callback(
                    null as any,
                    "mock_access_token",
                    "mock_refresh_token",
                    {}
                );
            }
        );
        mocks.mockLoadUserProfile.mockImplementationOnce(
            (
                access_token: string,
                cb: (err: any, profile: any) => void
            ): void => {
                cb(null, { profile: "mock_profile" });
            }
        );

        try {
            const res = await request(app)
                .get("/auth/google/callback")
                .query({
                    code:
                        "4/sAEZzb8MDIBoTTFTyZiRJaB5bBysCQC0zBdrAqwu-KtK3XtsalBUH_ZgWiTz4_tHb19lJI8bOgVYA04WfIiFuHc",
                    scope:
                        "profile https://www.googleapis.com/auth/userinfo.profile",
                })
                .expect(400);
        } finally {
            unmock_PassportGoogleOauth(mocks);
            mockVerify.mockClear();
        }
    });
});
