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

export function mock_PassportInitialize(): jest.Mock<
    void,
    [string, string, Profile, VerifyCallback]
> {
    const mockVerify = jest.fn();

    mockVerify &&
        jest.doMock("../passport", () => ({
            __esModule: true,
            default: (callbackURL: string) => {
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
        }));
    return mockVerify;
}

// mocking "../passport" to replace verify callback with our mock function
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

export function unmock_PassportGoogleOauth(mocks: PassportMockFns) {
    mocks.mockLoadUserProfile.mockRestore();
    mocks.mockGetOAuthAccessToken.mockRestore();
}
