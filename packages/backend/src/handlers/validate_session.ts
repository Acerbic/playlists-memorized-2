import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { BaseAPIResponse } from "../typings/definitions";

import { decode_session_token } from "../session";

import { get_user } from "../storage";

export const MALFORMED_SESSION_TOKEN = "MALFORMED_SESSION_TOKEN";
export const EXPIRED_SESSION_TOKEN = "EXPIRED_SESSION_TOKEN";

export interface ValidateSessionRequestBody {
    token: string;
}

export type ValidateSessionResponseBody = BaseAPIResponse;

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
                throw "Anonymous sessions not supported";
                break;
            case "google":
                // TODO: extra checks for tokens validity
                break;
            default:
                // unknown or empty type: error
                throw "Unknown session type";
                return;
        }

        res.json(<BaseAPIResponse>{
            success: true,
        });
    } catch (err) {
        res.status(400);
        res.json(<BaseAPIResponse>{
            success: false,
            errorMsg:
                typeof err === "object" ? (err as Error).message : String(err),
            errorCode: MALFORMED_SESSION_TOKEN,
        });
    }
});
