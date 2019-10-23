/**
 * Not tests themselves, but reusable utility functions to build / execute tests
 */

import passport from "passport";
import { OAuth2, oauth2tokenCallback } from "oauth";
import { Strategy } from "passport-oauth2";

import {
    Strategy as GoogleStrategy,
    Profile,
    VerifyCallback,
} from "passport-google-oauth20";

export interface PassportMockFns {
    mockGetOAuthAccessToken: jest.SpyInstance<
        void,
        [string, any, oauth2tokenCallback]
    >;
    mockLoadUserProfile: jest.SpyInstance<
        void,
        [any, (err: any, profile: any) => void]
    >;
}

/**
 * mocks passport configuration module - used to inject mock function as verify
 * function before app() is initialized
 * @returns jest.Mock - mock function (without implementation) that is inserted
 *          as verify function during PassportJS Strategy configuration
 */
export function mock_PassportInitialize(): jest.Mock<
    void,
    [string, string, Profile, VerifyCallback]
> {
    const mockVerify = jest.fn();
    const mockModule: Record<string, any> = {
        __esModule: true,
        configure: (callbackURL: string) => {
            passport.use(
                new GoogleStrategy(
                    {
                        clientID: process.env.GOOGLE_CLIENT_ID!,
                        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                        callbackURL,
                    },
                    mockVerify
                )
            );
        },
        verify: mockVerify,
    };
    mockModule.default = mockModule.configure;

    mockVerify && jest.doMock("../passport", () => mockModule);
    return mockVerify;
}

/**
 * Mocks PassportJS functions that do network queries to Google servers.
 * @param profile - Google profile to be substituted in mock implementation.
 * @returns PassportMockFns - an object, containing the mock functions generated.
 */
export function mock_PassportGoogleOauth(profile?: Profile): PassportMockFns {
    let mockGetOAuthAccessToken = (jest.spyOn(
        OAuth2.prototype,
        "getOAuthAccessToken"
    ) as any) as jest.SpyInstance<void, [string, any, oauth2tokenCallback]>;

    let mockLoadUserProfile = jest.spyOn(
        Strategy.prototype,
        "_loadUserProfile" as any
    ) as jest.SpyInstance<void, [any, (err: any, profile: any) => void]>;

    mockGetOAuthAccessToken.mockImplementation(
        (code: string, params: any, callback: oauth2tokenCallback): void => {
            callback(
                null as any,
                "mock_access_token",
                "mock_refresh_token",
                {}
            );
        }
    );
    mockLoadUserProfile.mockImplementation(
        (access_token: string, cb: (err: any, profile: any) => void): void => {
            cb(null, profile || { id: "mock google id" });
        }
    );

    return {
        mockGetOAuthAccessToken,
        mockLoadUserProfile,
    };
}

/**
 * Undo mock_PassportGoogleOauth
 * @param mocks the object returned by `mock_PassportGoogleOauth` earlier.
 */
export function unmock_PassportGoogleOauth(mocks: PassportMockFns) {
    mocks.mockLoadUserProfile.mockRestore();
    mocks.mockGetOAuthAccessToken.mockRestore();
}

// reusable template of profile
export const mock_user_profile: Profile = {
    id: "some id",
    provider: "google",
    profileUrl: "",
    _json: "",
    _raw: "",
    displayName: "Mock User",
};

// reusable query params as passed from Google to callback
export const mock_callback_query = {
    code:
        "4/sAEZzb8MDIBoTTFTyZiRJaB5bBysCQC0zBdrAqwu-KtK3XtsalBUH_ZgWiTz4_tHb19lJI8bOgVYA04WfIiFuHc",
    scope: "profile https://www.googleapis.com/auth/userinfo.profile",
    state: JSON.stringify({
        destination: "http://localhost:3000/google_auth",
    }),
};
