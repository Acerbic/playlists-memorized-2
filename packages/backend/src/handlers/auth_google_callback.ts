/**
 * Callback from Google OAuth server with auth results
 */

import passport from "passport";
import { Request, Response } from "express";

export default [
    passport.authenticate("google", {
        // TODO: fixme - replace fixed URL with param from frontend
        failureRedirect: "/login",
        session: false,
    }),
    function(req: Request, res: Response) {
        // Successful authentication, redirect home.

        try {
            const dest = req.query && JSON.parse(req.query.state).destination;
            new URL(dest); // throws TypeError if dest is not a correct url

            // user account procured from authentication by verification
            // function in strategy definition
            const user = req.user;
            // TODO: generate session token and pass to frontend as redirect param
            res.redirect(dest);
        } catch (ex) {
            res.status(400).end();
        }
    },
];
