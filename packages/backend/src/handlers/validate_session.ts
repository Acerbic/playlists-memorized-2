import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { BaseAPIResponse, SessionToken } from "../typings/definitions";

export const MALFORMED_SESSION_TOKEN = "MALFORMED_SESSION_TOKEN";

export interface ValidateSessionRequestBody {
    token: string;
}

export type ValidateSessionResponseBody =
    | ValidateSessionResponseBody_ValidToken
    | ValidateSessionResponseBody_NewAnonToken;

interface ValidateSessionResponseBody_ValidToken extends BaseAPIResponse {
    success: true;
}

interface ValidateSessionResponseBody_NewAnonToken extends BaseAPIResponse {
    success: false;
    anonymousToken?: string;
}

export default function(req: Request, res: Response) {
    const body: ValidateSessionRequestBody = req.body;
    // TODO: compare body against type
    // res.json({ reqraw: (req as any).rawBody, reqbody: req.body });
    // return;
    if (
        typeof body === "undefined" ||
        typeof body.token !== "string" ||
        body.token.length === 0
    ) {
        res.status(400).send();
        return;
    }

    const token: SessionToken = jwt.decode(body.token) as SessionToken;
    if (typeof token !== "object") {
        res.status(400).send();
        return;
    }
    switch (token.type) {
        case "anonymous":
            res.json(<ValidateSessionResponseBody>{
                success: false,
            });
            return;
        case "google":
            res.json(<ValidateSessionResponseBody>{
                success: false,
            });
            return;
        default:
            // unknown or empty type: error
            res.json(<ValidateSessionResponseBody>{
                success: false,
                errorCode: MALFORMED_SESSION_TOKEN,
                errorMsg: "Token did not have recognized `type` value",
            });
            return;
    }
}
