import { Request } from "jest-express/lib/request";
import { Response } from "jest-express/lib/response";

jest.mock("../../session", () => {
    return {
        create_temporary_auth_token: jest.fn(async () => "auth-token-temp"),
    };
});

import {
    GoogleAuthHandler,
    GoogleAuthErrorHandler,
} from "../auth_google_callback";

import AuthenticationError from "passport/lib/errors/authenticationerror";

describe("#unit #cold /auth/google/callback authentication failed", () => {
    it("should pass error if its unknown error", done => {
        const req = new Request("/auth/google/callback", { method: "GET" });
        const res = new Response();
        const next = jest.fn();
        const err = new Error();

        GoogleAuthErrorHandler(err, req as any, res as any, next);

        expect(res.status).not.toBeCalled();
        expect(res.end).not.toBeCalled();
        expect(next).toBeCalledWith(err);
        done();
    });

    it("should return code 400 if no redirect destination", done => {
        const req = new Request("/auth/google/callback", { method: "GET" });
        const res = new Response();
        const next = jest.fn();
        const err = new AuthenticationError();

        GoogleAuthErrorHandler(err, req as any, res as any, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.end).toBeCalled();
        expect(next).not.toBeCalled();
        done();
    });

    it("should return code 400 if redirect destination is not valid URL", done => {
        const req = new Request("/auth/google/callback", { method: "GET" });
        req.query = {
            state: JSON.stringify({ destination: "zzzz" }),
        };
        const res = new Response();
        const next = jest.fn();
        const err = new AuthenticationError();

        GoogleAuthErrorHandler(err, req as any, res as any, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.end).toBeCalled();
        expect(next).not.toBeCalled();
        done();
    });

    it("should redirect to destination with failure", done => {
        const req = new Request("/auth/google/callback", { method: "GET" });
        req.query = {
            state: JSON.stringify({
                destination: "http://destination.com/auth_fail",
            }),
        };
        const res = new Response();
        const next = jest.fn();
        const err = new AuthenticationError();

        GoogleAuthErrorHandler(err, req as any, res as any, next);

        expect(next).not.toBeCalled();
        expect(res.status).not.toBeCalledWith();
        expect(res.end).not.toBeCalled();
        expect(res.redirect).toBeCalledWith(
            expect.stringMatching("http://destination.com/auth_fail")
        );
        const redirectUrl = (res.redirect as jest.Mock).mock.calls[0][0];
        const params = new Map(new URL(redirectUrl).searchParams);
        expect(params.keys()).toContain("success");
        expect(params.get("success")).toBe("false");
        done();
    });
});

describe("#unit #cold /auth/google/callback authentication success", () => {
    it("should return code 400 if no redirect destination", done => {
        const req = new Request("/auth/google/callback", { method: "GET" });
        const res = new Response();
        const next = jest.fn();

        GoogleAuthHandler(req as any, res as any, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.end).toBeCalled();
        expect(next).not.toBeCalled();
        done();
    });

    it("should return code 400 if redirect destination is not valid URL", done => {
        const req = new Request("/auth/google/callback", { method: "GET" });
        req.query = {
            state: JSON.stringify({ destination: "zzzz" }),
        };
        const res = new Response();
        const next = jest.fn();

        GoogleAuthHandler(req as any, res as any, next);

        expect(res.status).toBeCalledWith(400);
        expect(res.end).toBeCalled();
        expect(next).not.toBeCalled();
        done();
    });

    it("should redirect to destination with failure if can't create a user", done => {
        const req = new Request("/auth/google/callback", { method: "GET" });
        req.query = {
            state: JSON.stringify({
                destination: "http://destination.com/auth_result",
            }),
        };
        (req as any).user = false;
        const res = new Response();
        const next = jest.fn();

        GoogleAuthHandler(req as any, res as any, next);

        expect(next).not.toBeCalled();
        expect(res.status).not.toBeCalledWith();
        expect(res.end).not.toBeCalled();
        expect(res.redirect).toBeCalledWith(
            expect.stringMatching("http://destination.com/auth_result")
        );
        const redirectUrl = (res.redirect as jest.Mock).mock.calls[0][0];
        const params = new Map(new URL(redirectUrl).searchParams);
        expect(params.keys()).toContain("success");
        expect(params.get("success")).toBe("false");
        done();
    });

    it("should redirect to destination with auth token if user created/found", done => {
        const req = new Request("/auth/google/callback", { method: "GET" });
        req.query = {
            state: JSON.stringify({
                destination: "http://destination.com/auth_result",
            }),
        };
        (req as any).user = {};
        const res = new Response();
        const next = jest.fn();

        (GoogleAuthHandler(req as any, res as any, next) as Promise<void>).then(
            () => {
                expect(next).not.toBeCalled();
                expect(res.status).not.toBeCalledWith();
                expect(res.end).not.toBeCalled();
                expect(res.redirect).toBeCalledWith(
                    expect.stringMatching("http://destination.com/auth_result")
                );
                const redirectUrl = (res.redirect as jest.Mock).mock
                    .calls[0][0];
                const params = new Map(new URL(redirectUrl).searchParams);
                expect(params.keys()).toContain("success");
                expect(params.get("success")).toBe("true");
                expect(params.get("token")).toBe("auth-token-temp");
                done();
            }
        );
    });
});
