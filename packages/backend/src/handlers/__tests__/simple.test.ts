/** Using supertest */

import request from "supertest";
import makeApp from "../../../src/app";

describe("Test the root path", () => {
    test("It should response the GET method", () => {
        return request(makeApp())
            .get("/")
            .then(response => {
                expect(response.status).toBe(200);
            });
    });
});
