import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BaseAPIResponse } from "../typings/definitions";

import {
    decode_session_token,
    create_anonymous_session,
    sign_session,
} from "../session";

import { get_user } from "../storage";

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
        const session = await decode_session_token(req.body.token);

        // check storage to confirm that this userId session is not stale
        // for anonymous user, check session expiration date
        // for google authenticated user, check with the google services that
        //      access tokens are still valid (update possibly)

        const user = await get_user(session.userId);
        switch (session.type) {
            case "anonymous":
                break;
            case "google":
                // TODO: extra checks for tokens validity
                break;
            default:
                // unknown or empty type: error
                res.json(<ValidateSessionResponseBody_NewAnonToken>{
                    success: false,
                    errorCode: "UNKNOWN_SESSION_TYPE",
                    anonymousToken: await create_anonymous_session().then(
                        sign_session
                    ),
                });
                return;
        }

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
