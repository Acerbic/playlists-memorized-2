/**
 * initiate login process --> will redirect to google login screen
 */

import passport from "passport";
import { Handler } from "express";
import url from "url";

export default <Handler>function(req, res, next) {
    let dest: URL | undefined;
    try {
        dest =
            req.query &&
            req.query.destination &&
            new URL(req.query.destination);
    } catch (ex) {
        dest = undefined;
    }

    if (dest) {
        passport.authenticate("google", {
            scope: ["profile"],
            session: false,
            accessType: "offline",
            state: JSON.stringify({ destination: req.query.destination }),
        })(req, res, next);
    } else {
        res.status(400).end();
    }
};
