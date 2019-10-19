/**
 * Exchange short-lived authentication token for long-term session token.
 * Authentication token should be provided as an Authorization Bearer header:
 * "Authorize": "Bearer qweqweqweqweq"
 * Missing Authorize field, incorrect or expired token would result in 401
 * response
 */

import { Handler } from "express";

import passport from "passport";
import { UserRecord, UserRecordGoogle } from "../storage";
import { create_user_session_token } from "../session";

export default <Array<Handler>>[
    passport.authenticate("jwt", { session: false }),
    (req, res, next) => {
        create_user_session_token(req.user as UserRecordGoogle)
            .then(token =>
                res.json({
                    token,
                })
            )
            .catch(next);
    },
];
