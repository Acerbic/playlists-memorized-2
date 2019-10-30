/**
 * initiate login process --> will redirect to google login screen
 */

import passport from "passport";
import { Handler } from "express";

export default <Handler>function(req, res, next) {
    try {
        const dest: URL =
            req.query &&
            req.query.destination &&
            new URL(req.query.destination);

        passport.authenticate("google", {
            scope: ["profile"],
            session: false,
            accessType: "offline",
            state: JSON.stringify({ destination: req.query.destination }),
        })(req, res, next);
    } catch (ex) {
        if (ex instanceof TypeError) {
            // bad destination URL
            res.status(400).end();
        } else {
            // unknown exception
            throw ex;
        }
    }
};
