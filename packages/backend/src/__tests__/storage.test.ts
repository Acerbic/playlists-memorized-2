/**
 * Testing storage functionality with prisma (requires running prisma server)
 */
import dotenv from "dotenv";
dotenv.config({
    path: ".env.test",
});
import { mock_user_profile } from "./_utils";
import {
    UserRecord,
    UserGoogleAuth,
    add_new_user,
    get_user,
    get_user_by_auth,
    reset_users_storage,
} from "../storage";

describe("storage with Prisma", () => {
    beforeAll(() => {});

    beforeEach(reset_users_storage);
    it("should store a new user", async () => {
        const userGoogleAuth: UserGoogleAuth = {
            type: "GOOGLE",
            authId: mock_user_profile.id,
            extra: {
                accessToken: "mock access token",
                refreshToken: "mock refresh token",
                profile: mock_user_profile,
            },
        };

        let user: UserRecord = {
            auth: {
                GOOGLE: userGoogleAuth,
            },
        };

        const user_id = await add_new_user(user);
        expect(user_id).toBeTruthy();
        expect(user_id.length).toBeGreaterThanOrEqual(1);
    });
    it("should be able to fetch user by id", async () => {
        const userGoogleAuth: UserGoogleAuth = {
            type: "GOOGLE",
            authId: mock_user_profile.id,
            extra: {
                accessToken: "mock access token",
                refreshToken: "mock refresh token",
                profile: mock_user_profile,
            },
        };

        let user: UserRecord = {
            auth: {
                GOOGLE: userGoogleAuth,
            },
        };

        const user_id = await add_new_user(user);
        expect(user_id).toBeTruthy();
        expect(user_id.length).toBeGreaterThanOrEqual(1);

        const retrieved_user = await get_user(user_id);
        expect(retrieved_user).not.toBeUndefined();
        expect(retrieved_user!.id).toEqual(user_id);
        expect(retrieved_user!.auth).toHaveProperty("GOOGLE");
        expect(retrieved_user!.auth.GOOGLE!.authId).toEqual(
            mock_user_profile.id
        );
    });

    it("should be able to find user by Auth Id", async () => {
        const userGoogleAuth: UserGoogleAuth = {
            type: "GOOGLE",
            authId: mock_user_profile.id,
            extra: {
                accessToken: "mock access token",
                refreshToken: "mock refresh token",
                profile: mock_user_profile,
            },
        };

        let user: UserRecord = {
            auth: {
                GOOGLE: userGoogleAuth,
            },
        };

        const user_id = await add_new_user(user);

        expect(user_id).toBeTruthy();
        expect(user_id.length).toBeGreaterThanOrEqual(1);

        const retrieved_user = await get_user_by_auth(
            "GOOGLE",
            mock_user_profile.id
        );

        expect(retrieved_user).not.toBeUndefined();
        expect(retrieved_user!.id).toEqual(user_id);
    });

    it.todo("should not allow to save user without Auth Id");

    it.todo("should update access token");
});
