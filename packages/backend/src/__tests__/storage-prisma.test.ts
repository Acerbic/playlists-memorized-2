/**
 * Testing storage functionality with prisma (requires running prisma server)
 */
import dotenv from "dotenv";
dotenv.config({
    path: ".env.test",
});
import { prisma } from "../../generated/prisma-client";
import { mock_user_profile } from "./_utils";
import { UserGoogleAuth } from "../models/User";
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
            auth_id: mock_user_profile.id,
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
            auth_id: mock_user_profile.id,
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
        expect(retrieved_user!.authentications.GOOGLE!.auth_id).toEqual(
            mock_user_profile.id
        );
    });

    it("should be able to find user by Auth Id", async () => {
        const storage = new StoragePrisma();
        const userGoogleAuth: Omit<UserGoogleAuth, "id"> = {
            type: "GOOGLE",
            auth_id: mock_user_profile.id,
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

    it("should not allow to save user without Auth Id", async () => {
        const storage = new StoragePrisma();
        expect(storage.add_new_user({}, [])).rejects.toThrowError();
    });

    it("should update authentication info - extra data", async () => {
        const storage = new StoragePrisma();
        const userGoogleAuth: Omit<UserGoogleAuth, "id"> = {
            type: "GOOGLE",
            auth_id: mock_user_profile.id,
            extra: {
                accessToken: "mock access token",
                refreshToken: "mock refresh token",
                profile: mock_user_profile,
            },
        };
        const user_id = await storage.add_new_user({}, [userGoogleAuth]);
        const user = await storage.get_user(user_id);
        user.authentications.GOOGLE!.extra.accessToken = "changed access token";

        await storage.update_user_record(user);

        const changed_user = await storage.get_user(user_id);
        expect(changed_user.authentications.GOOGLE!.extra.accessToken).toEqual(
            "changed access token"
        );
        expect(changed_user.authentications.GOOGLE!.auth_id).toEqual(
            user.authentications.GOOGLE!.auth_id
        );
    });

    it("should update authentication info - auth id", async () => {
        const storage = new StoragePrisma();
        const userGoogleAuth: Omit<UserGoogleAuth, "id"> = {
            type: "GOOGLE",
            auth_id: mock_user_profile.id,
            extra: {
                accessToken: "mock access token",
                refreshToken: "mock refresh token",
                profile: mock_user_profile,
            },
        };
        const user_id = await storage.add_new_user({}, [userGoogleAuth]);
        const user = await storage.get_user(user_id);
        user.authentications.GOOGLE!.auth_id = mock_user_profile.id + "+";
        user.authentications.GOOGLE!.extra.profile.id =
            mock_user_profile.id + "+";

        await storage.update_user_record(user);

        const changed_user = await storage.get_user(user_id);
        expect(changed_user.authentications.GOOGLE!.auth_id).toEqual(
            mock_user_profile.id + "+"
        );
        expect(changed_user.authentications.GOOGLE!.extra.profile.id).toEqual(
            mock_user_profile.id + "+"
        );
        const by_auth_id_user = await storage.find_user_by_auth(
            "GOOGLE",
            mock_user_profile.id + "+"
        );
        expect(by_auth_id_user).toStrictEqual(changed_user);
    });

    it.todo("should fail to add playlist if user object is incorrect");
    it.todo("should be able to add a new playlist");
    it.todo("should add only append a snapshot if playlist already exists");
    it.todo("should support more than one user sharing a playlist");
    it.todo("should be able to fetch a playlist by id");
    it.todo("should be able to fetch a snapshot by id");
});
