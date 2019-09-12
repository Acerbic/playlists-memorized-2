/// <reference types="../../typings/globals">
import jwt from "jsonwebtoken";
import request, { Response } from "supertest";
import makeApp from "../../../src/app";
import { AuthorizedGoogleSession } from "../../typings/definitions";
import {
    ValidateTokenRequestBody,
    ValidateTokenResponseBody,
} from "../validate_token";

const app = makeApp();

const VALIDATE_SESSION_ENDPOINT = "/validate_session";

describe("/validate_session endpoint", () => {
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

    it("should confirm a valid token", () => {
        const token: AuthorizedGoogleSession = {
            type: "google",
            userId: "00000",
            name: "Name Lastname",
            email: "example@example.com",
        };

        const encoded = jwt.sign(token, process.env.JWT_TOKEN || "");
        const req: ValidateTokenRequestBody = { token: encoded };
        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .send(req)
            .then(res => {
                expect(res.ok);
                expect(res.body as ValidateTokenResponseBody).toStrictEqual(
                    true
                );
            });
    });

    it("should fail an outdated valid token", () => {
        const token: AuthorizedGoogleSession = {
            type: "google",
            userId: "00000",
            name: "Name Lastname",
            email: "example@example.com",
        };

        const encoded = jwt.sign(token, process.env.JWT_TOKEN || "");
        return request(app)
            .post(VALIDATE_SESSION_ENDPOINT)
            .send({ token: encoded } as ValidateTokenRequestBody)
            .then(res => {
                expect(res.ok);
                expect<ValidateTokenResponseBody>(res.body).toStrictEqual(
                    false
                );
            });
    });
});
