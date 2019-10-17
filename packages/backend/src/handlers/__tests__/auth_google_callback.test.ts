import request from "supertest";
import { Profile } from "passport-google-oauth20";
import {
    mock_PassportGoogleOauth,
    mock_PassportInitialize,
    unmock_PassportGoogleOauth,
} from "../../__tests__/_utils";
const mockVerify = mock_PassportInitialize(); // must be executed before `import makeApp`

import makeApp from "../../app";
const app = makeApp();

import {
    find_google_user,
    find_or_create_google_user,
    reset_users_storage,
    UserRecord,
} from "../../storage";

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

// reusable query params as passed from Google to callback
const mock_callback_query = {
    code:
        "4/sAEZzb8MDIBoTTFTyZiRJaB5bBysCQC0zBdrAqwu-KtK3XtsalBUH_ZgWiTz4_tHb19lJI8bOgVYA04WfIiFuHc",
    scope: "profile https://www.googleapis.com/auth/userinfo.profile",
    state: JSON.stringify({
        destination: "http://localhost:3000/google_auth",
    }),
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

        return request(app)
            .get("/auth/google/callback")
            .query(mock_callback_query)
            .expect(302)
            .expect("Location", "http://localhost:3000/google_auth")
            .then(() => {
                expect(mocks.mockGetOAuthAccessToken.mock.calls.length).toEqual(
                    1
                );
                expect(mocks.mockLoadUserProfile.mock.calls.length).toEqual(1);
                expect(mockVerify.mock.calls.length).toEqual(1);
                expect(mockVerify.mock.calls[0][2]).toStrictEqual({
                    id: "mock google id",
                });
            })
            .finally(() => {
                unmock_PassportGoogleOauth(mocks);
                mockVerify.mockClear();
            });
    });

    it("should create user account if there's no user for this login", async () => {
        const mocks = mock_PassportGoogleOauth(mock_user_profile);
        mockVerify.mockImplementationOnce(originalVerify);

        expect(find_google_user(mock_user_profile)).resolves.toBeUndefined();
        try {
            const res = await request(app)
                .get("/auth/google/callback")
                .query(mock_callback_query)
                .expect(302);
            expect(
                find_google_user(mock_user_profile)
            ).resolves.not.toBeUndefined();
        } finally {
            unmock_PassportGoogleOauth(mocks);
            mockVerify.mockClear();
        }
    });

    it("should fetch existing account if the login is for existing user", async () => {
        const mocks = mock_PassportGoogleOauth(mock_user_profile);
        mockVerify.mockImplementationOnce(originalVerify);

        expect(find_google_user(mock_user_profile)).resolves.toBeUndefined();
        const record = await find_or_create_google_user(
            "mock_access_token",
            "mock_refresh_token",
            mock_user_profile
        );
        expect(
            find_google_user(mock_user_profile)
        ).resolves.not.toBeUndefined();

        try {
            const res = await request(app)
                .get("/auth/google/callback")
                .query(mock_callback_query)
                .expect(302);
            const recordAfter: UserRecord | undefined = await find_google_user(
                mock_user_profile
            );
            expect(recordAfter).not.toBeUndefined();
            expect(recordAfter!.type).toBe("google");
            expect(recordAfter!.userId).toBe(record!.userId);
        } finally {
            unmock_PassportGoogleOauth(mocks);
            mockVerify.mockClear();
        }
    });

    it("should fail if missing redirect data", async () => {
        const mocks = mock_PassportGoogleOauth();
        mockVerify.mockImplementationOnce(
            (access_token, refresh_token, profile, done): any =>
                done(undefined, "mock-usr-id")
        );

        try {
            const res = await request(app)
                .get("/auth/google/callback")
                .query(Object.assign(mock_callback_query, { state: undefined }))
                .expect(400);
        } finally {
            unmock_PassportGoogleOauth(mocks);
            mockVerify.mockClear();
        }
    });
});
