import { Request, Response, Handler } from "express";
import asyncHandler from "express-async-handler";
import passport from "passport";
import { BaseAPIResponse } from "../routes";

import { UserRecord } from "../storage";

export const MALFORMED_SESSION_TOKEN = "MALFORMED_SESSION_TOKEN";
export const EXPIRED_SESSION_TOKEN = "EXPIRED_SESSION_TOKEN";

export type ValidateSessionResponseBody = BaseAPIResponse;

export default <Array<Handler>>[
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async function(req: Request, res: Response) {
        try {
            const user = req.user as UserRecord;
            switch (user.type) {
                case "anonymous":
                    throw "Anonymous sessions not supported";
                    break;
                case "google":
                    // TODO: extra checks for tokens validity
                    break;
                default:
                    // unknown or empty type: error
                    throw "Unknown session type";
            }

            res.json(<BaseAPIResponse>{
                success: true,
            });
        } catch (err) {
            res.status(400);
            res.json(<BaseAPIResponse>{
                success: false,
                errorMsg:
                    typeof err === "object"
                        ? (err as Error).message
                        : String(err),
                errorCode: MALFORMED_SESSION_TOKEN,
            });
        }
    }),
];
