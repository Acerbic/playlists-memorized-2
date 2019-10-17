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

        // user account procured from authentication by verification
        // function in strategy definition
        const user = req.user;
        // TODO: fixme - replace fixed URL with param from frontend
        res.redirect("http://localhost:3000/login_success");
    },
];
