/**
 * Testing JWT session manipulation utilities
 */

import dotenv from "dotenv";
dotenv.config({
    path: ".env.test",
});

import {
    sign_session,
    decode_session_token,
    create_temporary_auth_token,
    create_user_session_token,
    AnonymousSession,
    LoginTokenSession,
    AuthorizedGoogleSession,
} from "../session";
import { User } from "../models/User";
import { mock_user_profile } from "./_utils";

describe("session manipulation utils #unit #cold", () => {
    beforeAll(() => {
        if (!process.env.JWT_SECRET) {
            process.env.JWT_SECRET = "fake secret";
        }
    });

    it("should be able successfully encode-decode a session", async () => {
        const anonymous_session: AnonymousSession = {
            type: "anonymous",
            userId: "abcd",
        };

        const decoded_a_s = await decode_session_token(
            await sign_session(anonymous_session)
        );
        expect(decoded_a_s.type).toStrictEqual("anonymous");
        expect(decoded_a_s.userId).toStrictEqual("abcd");
    });

    it("should be able to generate short-lived tokens", async () => {
        const user: User = {
            id: "123abc",
            authentications: {
                GOOGLE: {
                    id: "345dsa",
                    type: "GOOGLE",
                    authId: mock_user_profile.id,
                    extra: {
                        accessToken: "mock_access_token",
                        refreshToken: "mock_refresh_token",
                        profile: mock_user_profile,
                    },
                },
            },
        };
        const short_token = await create_temporary_auth_token(user);
        const short_session = (await decode_session_token(
            short_token
        )) as LoginTokenSession;

        expect(short_session.type).toStrictEqual("login-token");
        expect(short_session.userId).toStrictEqual("123abc");
        const timenow: number = new Date().getTime();
        expect(short_session.iat).toBeLessThanOrEqual(timenow);
        expect(short_session.exp).toBeLessThanOrEqual(timenow + 60);
    });

    it("should be able to generate long-term tokens", async () => {
        const user: User = {
            id: "123abc",
            authentications: {
                GOOGLE: {
                    id: "345dsa",
                    type: "GOOGLE",
                    authId: mock_user_profile.id,
                    extra: {
                        accessToken: "mock_access_token",
                        refreshToken: "mock_refresh_token",
                        profile: mock_user_profile,
                    },
                },
            },
        };

        const long_token = await create_user_session_token(user);
        const long_session = (await decode_session_token(
            long_token
        )) as AuthorizedGoogleSession;

        const timenow: number = new Date().getTime();
        expect(long_session.type).toEqual("google");
        expect(long_session.userId).toEqual("123abc");
        expect(long_session.userGoogleId).toEqual(mock_user_profile.id);
        expect(long_session.iat).toBeLessThanOrEqual(timenow);
        expect(long_session.exp).toBeUndefined();
    });
});
