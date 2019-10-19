import request from "supertest";
import jwt from "jsonwebtoken";

import { Profile } from "passport-google-oauth20";

import makeApp from "../../app";
const app = makeApp();

// TODO: rename misnomer
import { create_temporary_auth_token } from "../../session";
import { find_or_create_google_user } from "../../storage";

// reusable template of profile
const mock_user_profile: Profile = {
    id: "some id",
    provider: "google",
    profileUrl: "",
    _json: "",
    _raw: "",
    displayName: "Mock User",
};

describe("route /start_session", () => {
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
        const record = await find_or_create_google_user(
            "mock_tok",
            "mock_tok",
            Object.assign({}, mock_user_profile)
        );
        const at_signed = await create_temporary_auth_token(record);
        return request(app)
            .get("/start_session")
            .set("Authorization", "Bearer " + at_signed)
            .expect(200);
    });
});
