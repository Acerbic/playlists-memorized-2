import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BaseAPIResponse } from "../typings/definitions";

import {
    decode_session_token,
    create_anonymous_session,
    sign_session,
} from "../session";

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

export default asyncHandler(async function(req: Request, res: Response) {
    try {
        await decode_session_token(req.body.token);
        res.json(<ValidateSessionResponseBody_ValidToken>{
            success: true,
        });
    } catch (err) {
        res.status(400);
        res.json(<ValidateSessionResponseBody_NewAnonToken>{
            success: false,
            anonymousToken: await create_anonymous_session().then(sign_session),
        });
    }
});
