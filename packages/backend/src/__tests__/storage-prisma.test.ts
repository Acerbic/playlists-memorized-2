/**
 * Testing storage functionality with prisma (requires running prisma server)
 */
import dotenv from "dotenv";
dotenv.config({
    path: ".env.test",
});
import { prisma } from "../../generated/prisma-client";
import { mock_user_profile } from "./_utils";
import { UserGoogleAuth } from "../storage";
import { StoragePrisma } from "../storage-prisma";

describe("storage with Prisma #unit", () => {
    beforeAll(() => {});

    beforeEach(async () => {
        return prisma
            .deleteManyUserAuths()
            .then(() => prisma.deleteManyUsers());
    });

    it("should store a new user", async () => {
        const storage = new StoragePrisma();
        const userGoogleAuth: Omit<UserGoogleAuth, "id"> = {
            type: "GOOGLE",
            authId: mock_user_profile.id,
            extra: {
                accessToken: "mock access token",
                refreshToken: "mock refresh token",
                profile: mock_user_profile,
            },
        };

        const user_id = await storage.add_new_user({}, [userGoogleAuth]);

        expect(user_id).toBeTruthy();
        expect(user_id.length).toBeGreaterThanOrEqual(1);
    });

    it("should be able to fetch user by id", async () => {
        const storage = new StoragePrisma();
        const userGoogleAuth: Omit<UserGoogleAuth, "id"> = {
            type: "GOOGLE",
            authId: mock_user_profile.id,
            extra: {
                accessToken: "mock access token",
                refreshToken: "mock refresh token",
                profile: mock_user_profile,
            },
        };
        const user_id = await storage.add_new_user({}, [userGoogleAuth]);

        const retrieved_user = await storage.get_user(user_id);

        expect(retrieved_user).not.toBeUndefined();
        expect(retrieved_user!.id).toEqual(user_id);
        expect(retrieved_user!.authentications).toHaveProperty("GOOGLE");
        expect(retrieved_user!.authentications.GOOGLE!.authId).toEqual(
            mock_user_profile.id
        );
    });

    it("should be able to find user by Auth Id", async () => {
        const storage = new StoragePrisma();
        const userGoogleAuth: Omit<UserGoogleAuth, "id"> = {
            type: "GOOGLE",
            authId: mock_user_profile.id,
            extra: {
                accessToken: "mock access token",
                refreshToken: "mock refresh token",
                profile: mock_user_profile,
            },
        };
        const user_id = await storage.add_new_user({}, [userGoogleAuth]);

        const retrieved_user = await storage.find_user_by_auth(
            "GOOGLE",
            mock_user_profile.id
        );

        expect(retrieved_user).not.toBeUndefined();
        expect(retrieved_user!.id).toEqual(user_id);
    });

    it.todo("should not allow to save user without Auth Id");

    it.todo("should update access token");
});
