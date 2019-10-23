import {
    sign_session,
    decode_session_token,
    create_temporary_auth_token,
    create_user_session_token,
    AnonymousSession,
    LoginTokenSession,
    AuthorizedGoogleSession,
} from "../session";
import { UserRecordGoogle } from "../storage";
import { mock_user_profile } from "./_utils";

describe("session manipulation utils", () => {
    let previous_JWT_SECRET: any;

    beforeAll(() => {
        previous_JWT_SECRET = process.env.JWT_SECRET;
        process.env.JWT_SECRET = "fake secret";
    });
    afterAll(() => {
        process.env.JWT_SECRET = previous_JWT_SECRET;
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
        const user: UserRecordGoogle = {
            type: "google",
            userId: "123abc",
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
            googleUserId: mock_user_profile.id,
            profile: mock_user_profile,
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
        const user: UserRecordGoogle = {
            type: "google",
            userId: "123abc",
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
            googleUserId: mock_user_profile.id,
            profile: mock_user_profile,
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
