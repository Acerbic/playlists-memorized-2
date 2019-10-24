import jwt from "jsonwebtoken";
import request from "supertest";
import makeApp from "../../app";
import {
    AuthorizedGoogleSession,
    AnonymousSession,
    sign_session,
} from "../../session";
import {
    ValidateSessionResponseBody,
    MALFORMED_SESSION_TOKEN,
} from "../validate_session";
import { add_new_user } from "../../storage";

const app = makeApp();

const VALIDATE_SESSION_ENDPOINT = "/validate_session";

describe("route /validate_session", () => {
    beforeAll(() => {});

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
        const userId = await add_new_user({
            type: "google",
            googleUserId: "999888qwerty",
            profile: { id: "999888qwerty" } as any,
            accessToken: "123",
            refreshToken: "456",
        });
        const token: AuthorizedGoogleSession = {
            type: "google",
            userId: userId,
            userGoogleId: "1234567",
            profile: { id: "1234567" } as any,
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
            });
    });

    it.todo("should refresh valid token if outdated");
    it.todo(
        "should return an error code if access token invalid and refresh failed"
    );
});
