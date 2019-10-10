import request from "supertest";
import makeApp from "../app";

const app = makeApp();

describe("route /auth/google", () => {
    it("should redirect to google login screen", () =>
        request(app)
            .get("/auth/google")
            .expect(302)
            .expect("Location", /^https:\/\/accounts.google.com/));
});

describe("route /auth/google/callback", () => {
    it("should redirect on login failure", () => {
        throw "Not Implemented";
    });
});
