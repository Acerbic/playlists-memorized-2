/**
 * Callback from Google OAuth server with auth results
 */

import passport from "passport";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { UserRecord } from "../storage";
import { sign_session, UserSession } from "../session";
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
                new URL(dest); // throws TypeError if dest is not a correct url

                const login_results: LoginResults = {
                    success: false,
                };

                // FIXME: use JWT query param instead of cookie.
                res.cookie("login_results", JSON.stringify(login_results));

                res.redirect(dest);
            } catch (ex) {
                res.status(400).end();
            }
        }
    },
    asyncHandler(async function(req: Request, res: Response) {
        // Successful authentication, redirect home.

        try {
            const dest = req.query && JSON.parse(req.query.state).destination;
            new URL(dest); // throws TypeError if dest is not a correct url

            // user account procured from authentication by verification
            // function in strategy definition
            const user: UserRecord | undefined = req.user as UserRecord;

            // generate session token and pass to frontend as cookie on redirect
            const login_results: LoginResults = user
                ? {
                      success: true,
                      token: await sign_session(<UserSession>{
                          type: "google",
                          userId: user.userId,
                      }),
                  }
                : {
                      success: false,
                  };

            res.cookie("login_results", JSON.stringify(login_results));

            res.redirect(dest);
        } catch (ex) {
            res.status(400).end();
        }
    }),
];
