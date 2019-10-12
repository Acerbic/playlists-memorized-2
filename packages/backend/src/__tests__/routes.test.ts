import request from "supertest";
import { OAuth2, oauth2tokenCallback } from "oauth";
import { Strategy } from "passport-oauth2";
import makeApp from "../app";

// mocking "../passport" to replace verify callback with our mock function
import passport from "passport";
import {
    Strategy as GoogleStrategy,
    Profile,
    VerifyCallback,
} from "passport-google-oauth20";
const mockProfileVerify = jest.fn<
    void,
    [string, string, Profile, VerifyCallback]
>((access_token, refresh_token, profile, done) => done(undefined, "usr-id"));

jest.mock("../passport", () => ({
    __esModule: true,
    default: (callbackURL: string) => {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                    callbackURL,
                },
                // User verification function
                // from "profile" and with accessToken for extra data fetching,
                // construct a user entity to be passed for the middleware following
                // successful authentication (of fail authentication)
                // In the following  middleware, see req.user field
                mockProfileVerify
            )
        );
    },
}));
const app = makeApp();

describe("route /auth/google", () => {
    it("should redirect to google login screen", () =>
        request(app)
            .get("/auth/google")
            .expect(302)
            .expect("Location", /^https:\/\/accounts\.google\.com/));
});

describe("route /auth/google/callback", () => {
    it("should redirect to google login screen without args", () =>
        request(app)
            .get("/auth/google/callback")
            .expect(302)
            .expect("Location", /^https:\/\/accounts\.google\.com/));

    it("should redirect to error page on login error", () =>
        request(app)
            .get("/auth/google/callback")
            .query({ error: "access_denied" })
            .expect(302)
            .expect("Location", "/login"));

    it("should redirect to login success page on success", () => {
        let mockGetOAuthAccessToken = (jest.spyOn(
            OAuth2.prototype,
            "getOAuthAccessToken"
        ) as any) as jest.SpyInstance<void, [string, any, oauth2tokenCallback]>;
        mockGetOAuthAccessToken.mockImplementationOnce(
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

        type callBack = (err: any, profile: any) => void;
        let mockLoadUserProfile = jest.spyOn(
            Strategy.prototype,
            "_loadUserProfile" as any
        ) as jest.SpyInstance<void, [any, callBack]>;

        mockLoadUserProfile.mockImplementationOnce(
            (access_token: string, cb: callBack): void => {
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
            })
            .expect(302)
            .expect("Location", "http://localhost:3000/login_success")
            .then(() => {
                expect(mockGetOAuthAccessToken.mock.calls.length).toEqual(1);
                expect(mockLoadUserProfile.mock.calls.length).toEqual(1);
                expect(mockProfileVerify.mock.calls.length).toEqual(1);
                expect(mockProfileVerify.mock.calls[0][2]).toStrictEqual({
                    profile: "mock_profile",
                });
            })
            .finally(() => {
                mockGetOAuthAccessToken.mockRestore();
                mockLoadUserProfile.mockRestore();
                mockProfileVerify.mockClear();
            });
    });
});
