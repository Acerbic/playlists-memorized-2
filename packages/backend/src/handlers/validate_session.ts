import { Request, Response, Handler, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import passport from "passport";

import { BaseAPIResponse } from "../routes";
import { UserRecord, UserNotFoundError } from "../storage";

export const MALFORMED_SESSION_TOKEN = "MALFORMED_SESSION_TOKEN";
export const EXPIRED_SESSION_TOKEN = "EXPIRED_SESSION_TOKEN";

export type ValidateSessionResponseBody = BaseAPIResponse;

/**
 * Error handled in case authentication failed
 */
function JWTAuthErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof UserNotFoundError) {
        res.status(200);
        res.json(<BaseAPIResponse>{
            success: false,
            errorMsg: err.message,
            errorCode: MALFORMED_SESSION_TOKEN,
        });
    } else {
        // not an authentication error - continue with default error handling
        next(err);
    }
}

export default <Array<Handler>>[
    passport.authenticate("jwt", { session: false }),
    JWTAuthErrorHandler,
    asyncHandler(async function(req: Request, res: Response) {
        res.json(<BaseAPIResponse>{
            success: true,
        });
    }),
];
