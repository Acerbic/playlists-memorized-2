import jwt from "jsonwebtoken";
import request from "supertest";
import makeApp from "../../app";
import { AuthorizedGoogleSession, AnonymousSession } from "../../session";
import {
    ValidateSessionRequestBody,
    ValidateSessionResponseBody,
} from "../validate_session";
import { add_new_user, UserDataAnonymous, UserDataGoogle } from "../../storage";

const app = makeApp();

const VALIDATE_SESSION_ENDPOINT = "/validate_session";

describe("/validate_session endpoint", () => {
    beforeAll(() => {});

    it("should not respond to GET method", () =>
        request(app)
            .get(VALIDATE_SESSION_ENDPOINT)
            .expect(404));

    it("should contain proper token argument", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .expect(400));
    it("should contain proper token argument 2", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .send({ token: false })
            .expect(400));
    it("should contain proper token argument 3", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .send({ token: "" })
            .expect(400));
    it("should contain proper token argument 4", () =>
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .send("asdasd")
            .expect(400));
    it("should generate an anonymous session on error", () => {
        request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .send("??")
            .expect(400)
            .then(res => {
                expect(res.body).toStrictEqual({
                    success: false,
                    anonymousToken: expect.stringMatching(/.+/),
                });
            });
    });

    it("should fail on unknown token", () => {
        const token: AnonymousSession = {
            type: "anonymous",
            userId: "unknown-user",
        };

        const encoded = jwt.sign(token, process.env.JWT_SECRET!);
        const req: ValidateSessionRequestBody = { token: encoded };
        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .send(req)
            .then(res => {
                expect(res.ok).toBe(false);
                expect(res.body as ValidateSessionResponseBody).toStrictEqual({
                    success: false,
                    anonymousToken: expect.stringMatching(/.+/),
                });
            });
    });

    it("should confirm a valid token", async () => {
        const userId = await add_new_user("google", <UserDataGoogle>{
            accessToken: "123",
            refreshToken: "456",
        });
        const token: AuthorizedGoogleSession = {
            type: "google",
            userId: userId,
            name: "Name Lastname",
            email: "example@example.com",
        };

        const encoded = jwt.sign(token, process.env.JWT_SECRET!);
        const req: ValidateSessionRequestBody = { token: encoded };
        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .send(req)
            .then(res => {
                expect(res.ok).toBe(true);
                expect(res.body as ValidateSessionResponseBody).toStrictEqual({
                    success: true,
                });
            });
    });

    it("should fail an outdated valid token", () => {
        const token: AuthorizedGoogleSession = {
            type: "google",
            userId: "00000",
            name: "Name Lastname",
            email: "example@example.com",
        };

        const encoded = jwt.sign(token, process.env.JWT_SECRET!);
        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .send({ token: encoded } as ValidateSessionRequestBody)
            .then(res => {
                expect(res.ok).toBe(true);
                expect<ValidateSessionResponseBody>(res.body).toStrictEqual({
                    success: false,
                });
            });
    });
});
