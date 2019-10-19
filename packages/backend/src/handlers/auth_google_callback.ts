/**
 * Callback from Google OAuth server with auth results
 */

import passport from "passport";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { UserRecord } from "../storage";
import { create_temporary_auth_token } from "../session";
import { NextFunction } from "connect";

export interface LoginResults {
    success: boolean;
    token?: string;
}

export default [
    passport.authenticate("google", {
        // allows to catch auth error as Express error, instead of default
        // behavior
        failWithError: true,
        session: false,
    }),
    // error handled in case authentication failed
    function(err: any, req: Request, res: Response, next: NextFunction) {
        if (err.name !== "AuthenticationError") {
            // not an authentication error - continue with default error handling
            next(err);
        } else {
            try {
                const dest =
                    req.query && JSON.parse(req.query.state).destination;
                const u = new URL(dest); // throws TypeError if dest is not a correct url

                u.searchParams.set("success", "false");

                res.redirect(u.href);
            } catch (ex) {
                res.status(400).end();
            }
        }
    },
    asyncHandler(async function(req: Request, res: Response) {
        // Successful authentication, redirect home.

        try {
            const dest = req.query && JSON.parse(req.query.state).destination;
            const u = new URL(dest); // throws TypeError if dest is not a correct url

            // user account procured from authentication by verification
            // function in strategy definition
            const user: UserRecord | undefined = req.user as UserRecord;

            // generate temp token and pass to frontend as query param on
            // redirect
            if (user) {
                u.searchParams.set("success", "true");
                u.searchParams.set(
                    "token",
                    await create_temporary_auth_token(user)
                );
            } else {
                u.searchParams.set("success", "false");
            }

            res.redirect(u.href);
        } catch (ex) {
            res.status(400).end();
        }
    }),
];
