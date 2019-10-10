import {
    create_anonymous_session,
    sign_session,
    decode_session_token,
} from "../session";

describe("session manipulation utils", () => {
    let previous_JWT_SECRET: any;

    beforeAll(() => {
        previous_JWT_SECRET = process.env.JWT_SECRET;
        process.env.JWT_SECRET = "fake secret";
    });
    afterAll(() => {
        process.env.JWT_SECRET = previous_JWT_SECRET;
    });
    it("should be able to create anonymous session", async () => {
        const session = await create_anonymous_session();
        expect(session).toBeTruthy();
        expect(session.type).toEqual("anonymous");

        const decoded = await decode_session_token(await sign_session(session));
        expect(session.type).toStrictEqual(decoded.type);
        expect(session.userId).toStrictEqual(decoded.userId);
    });
});
