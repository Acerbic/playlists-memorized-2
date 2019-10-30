import request from "supertest";

import makeApp from "../../app";
const app = makeApp();

describe("route /auth/google", () => {
    it("should redirect (302) to google login screen on good request", () =>
        request(app)
            .get("/auth/google")
            .query({ destination: "https://custom.frontend.com/google_auth" })
            .expect(302)
            .expect("Location", /^https:\/\/accounts\.google\.com/));

    it("should fail (400) if destination is not a valid url", () =>
        request(app)
            .get("/auth/google")
            .query({ destination: "not a valid url" })
            .expect(400));

    it("should fail (400) if no destination redirect is provided", () =>
        request(app)
            .get("/auth/google")
            .expect(400));
});
