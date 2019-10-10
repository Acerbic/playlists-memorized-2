import request from "supertest";
import makeApp from "../app";

const app = makeApp();

describe("route /auth/google", () => {
    it("should redirect to google login screen", () =>
        request(app)
            .get("/auth/google")
            .expect(302)
            .expect("Location", /^https:\/\/accounts\.google\.com/));
});

describe("route /auth/google/callback", () => {
    it("should redirect to google login screen without args", () =>
        request(app)
            .get("/auth/google/callback")
            .expect(302)
            .expect("Location", /^https:\/\/accounts\.google\.com/));

    it("should redirect to error page on login error", () =>
        request(app)
            .get("/auth/google/callback")
            .query({ error: "access_denied" })
            .expect(302)
            .expect("Location", "/login"));

    it("should redirect to login success page on success", () => {
        throw "Not implemented";
        /*
Object {code: "4/sAGDKoQJsdbyKVDUYFGV0Qjzr90nCPuGwxsRo1wIyT_5u2rO…", scope: "profile https://www.googleapis.com/auth/userinfo.p…"}
*/
    });
});
