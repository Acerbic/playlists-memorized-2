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
    };
    mockModule.default = mockModule.configure;

    mockVerify && jest.doMock("../passport", () => mockModule);
    return mockVerify;
}

/**
 * Mocks PassportJS functions that do network queries to Google servers.
 * @returns PassportMockFns - an object, containing the mock functions generated.
 */
export function mock_PassportGoogleOauth(): PassportMockFns {
    let mockGetOAuthAccessToken = (jest.spyOn(
        OAuth2.prototype,
        "getOAuthAccessToken"
    ) as any) as jest.SpyInstance<void, [string, any, oauth2tokenCallback]>;

    let mockLoadUserProfile = jest.spyOn(
        Strategy.prototype,
        "_loadUserProfile" as any
    ) as jest.SpyInstance<void, [any, (err: any, profile: any) => void]>;

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
