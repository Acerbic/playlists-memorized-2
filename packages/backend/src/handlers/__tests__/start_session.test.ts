import request from "supertest";
import jwt from "jsonwebtoken";
import { Express } from "express";

import makeApp from "../../app";

import { create_temporary_auth_token } from "../../session";

import {
    MockStorageUsers,
    MockSingleUserStorage,
} from "../../__tests__/_mock_storage_user";
import { UserRecord } from "../../storage";

describe("route /start_session", () => {
    let app: Express;
    beforeAll(() => {
        app = makeApp({ storage: new MockStorageUsers() });
    });
    beforeEach(() => {
        app.set("storage", new MockStorageUsers());
    });
    it("should fail if no Authorization header", () =>
        request(app)
            .get("/start_session")
            .expect(401));
    it("should fail if Authorization header is not a valid JWT", () =>
        request(app)
            .get("/start_session")
            .set("Authorization", "Bearer 123123123123")
            .expect(401));

    it("should fail if authorization token is outdated", async () => {
        const at_signed = jwt.sign({}, process.env.JWT_SECRET!, {
            expiresIn: -60,
        });
        return request(app)
            .get("/start_session")
            .set("Authorization", "Bearer " + at_signed)
            .expect(401);
    });

    it("should return JSON response with a session token, in exchange for a good auth token", async () => {
        const storage = new MockSingleUserStorage();
        app.set("storage", storage);
        const record: UserRecord = storage._get_user(storage.single_user_id);

        const at_signed = await create_temporary_auth_token(record);
        return request(app)
            .get("/start_session")
            .set("Authorization", "Bearer " + at_signed)
            .expect(200);
    });
});
