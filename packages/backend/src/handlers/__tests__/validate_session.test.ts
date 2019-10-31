import request from "supertest";
import { Express } from "express";
import jwt from "jsonwebtoken";

import makeApp from "../../app";

import {
    AuthorizedGoogleSession,
    AnonymousSession,
    sign_session,
} from "../../session";

import { ValidateSessionResponseBody } from "../validate_session";
import {
    mock_user_profile,
    MockSingleUserStorage,
    MockStorage,
} from "../../__tests__/_utils";

describe("route /validate_session", () => {
    let app: Express;

    const VALIDATE_SESSION_ENDPOINT = "/validate_session";

    beforeAll(() => {
        // instantiate app
        app = makeApp();
    });

    beforeEach(() => {
        // return reset_users_storage();
        app.set("storage", new MockStorage());
    });

    it("should not respond to GET method", () =>
        request(app)
            .get(VALIDATE_SESSION_ENDPOINT)
            .expect(404));

    it("should contain proper token argument", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .expect(401));

    it("should contain proper token argument 3", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer ")
            .expect(401));

    it("should contain proper token argument 4", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer " + "some value")
            .expect(401));

    it("should fail on unknown token", () => {
        const token: AnonymousSession = {
            type: "anonymous",
            userId: "unknown-user",
        };
        const encoded = jwt.sign(token, process.env.JWT_SECRET!);
        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer " + encoded)
            .then(res => expect(res.ok).toBe(false));
    });

    it("should confirm a valid token", async () => {
        const storage = new MockSingleUserStorage();
        app.set("storage", storage);
        const token: AuthorizedGoogleSession = {
            type: "google",
            userId: storage.single_user_id,
            userGoogleId: mock_user_profile.id,
            profile: mock_user_profile,
        };
        const encoded = await sign_session(token);

        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .set("Authorization", "Bearer " + encoded)
            .then(res => {
                expect(res.ok).toBe(true);
                expect(res.body as ValidateSessionResponseBody).toStrictEqual({
                    success: true,
                });
                expect(storage.get_user).toBeCalledTimes(1);
            });
    });

    it.todo("should fail valid token for missing user");
});
