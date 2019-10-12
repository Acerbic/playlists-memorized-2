import { Express } from "express";
import validate_session from "./handlers/validate_session";
import { AppOptions } from "./app";

import passport from "passport";

export default function(app: Express, opts: AppOptions) {
    // Setup routes, middleware, and handlers
    app.post("/validate_session", validate_session);
    // initiate login process --> will redirect to google login screen
    app.get(
        "/auth/google",
        // function(req, res, next) {
        //     next();
        // },
        passport.authenticate("google", {
            scope: ["profile"],
            session: false,
            accessType: "offline",
        })
    );

    // receive redirect from google oauth.
    app.get(
        "/auth/google/callback",
        passport.authenticate("google", {
            // TODO: fixme - replace fixed URL with param from frontend
            failureRedirect: "/login",
            session: false,
        }),
        function(req, res) {
            // Successful authentication, redirect home.

            // user account procured from authentication by verification
            // function in strategy definition
            const user = req.user;
            // TODO: fixme - replace fixed URL with param from frontend
            res.redirect("http://localhost:3000/login_success");
        }
    );
}
