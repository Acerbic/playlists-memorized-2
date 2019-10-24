import { Handler } from "express";
import passport from "passport";

export default <Array<Handler>>[
    passport.authenticate("jwt", { session: false }),
    (req, res, next) => {
        throw "not implemented";
    },
];
