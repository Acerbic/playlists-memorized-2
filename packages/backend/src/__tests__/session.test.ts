import { sign_session, decode_session_token } from "../session";

describe("session manipulation utils", () => {
    let previous_JWT_SECRET: any;

    beforeAll(() => {
        previous_JWT_SECRET = process.env.JWT_SECRET;
        process.env.JWT_SECRET = "fake secret";
    });
    afterAll(() => {
        process.env.JWT_SECRET = previous_JWT_SECRET;
    });

    it.todo("add some tests");
});
