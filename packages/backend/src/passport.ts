/**
 * Configure authentication with Passport.js
 */

import passport from "passport";
import {
    Strategy as GoogleStrategy,
    Profile,
    VerifyCallback as VerifyCB_GoogleOAuth20,
} from "passport-google-oauth20";
import { Request } from "express";
import { DbStorage, UserNotFoundError } from "./contracts/DbStorage";
import {
    Strategy as JWTStrategy,
    ExtractJwt,
    VerifiedCallback as VerifyCB_JWT,
} from "passport-jwt";

/**
 * User verification function for "passport-google-oauth20" strategy.
 * From Google Profile profile and with accessToken for (possible) extra data
 * fetching, construct a user entity to be passed for the middleware following
 * successful authentication (of fail authentication).
 *
 * In the following middleware, see req.user field.
 *
 * @param req - incoming express Request
 * @param accessToken - Google access token
 * @param refreshToken - Google refresh token
 * @param profile - Google profile entity
 * @param done - callback to passport to indicate failure or success of verification
 */
export function verifyGoogleOAuth20(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCB_GoogleOAuth20
): void {
    // fetch user entity
    const storage: DbStorage = req.app.get("storage");
    if (!storage) {
        done(new Error("Express app must have a storage initiated"), false);
    } else {
        storage.find_user_by_auth("GOOGLE", profile.id).then(
            userRecord => {
                // TODO: check if update auth needed;

                done(undefined, userRecord);
            },
            (err: any) => {
                if (err instanceof UserNotFoundError) {
                    // creating a new user for this authentication
                    storage
                        .add_new_user({}, [
                            {
                                type: "GOOGLE",
                                authId: profile.id,
                                extra: {
                                    accessToken,
                                    refreshToken,
                                    profile,
                                },
                            },
                        ])
                        .then(storage.get_user)
                        .then(
                            user => done(undefined, user),
                            (err: any) => done(err, false)
                        );
                } else {
                    // some other error
                    done(err, false);
                }
            }
        );
    }
}

/**
 * User verification function for "passport-google-oauth20" strategy.
 * Malformed or outdated tokens will produce an error in authentication middleware
 * and this function will not be called at all.
 *
 * @param req - incoming express Request
 * @param payload - JWT payload decoded
 * @param done - callback to passport to indicate failure or success of verification
 */
export function verifyJWT(req: Request, payload: any, done: VerifyCB_JWT) {
    const storage: DbStorage = req.app.get("storage");
    if (!storage) {
        done(new Error("Express app must have a storage initiated"), false);
    } else {
        storage
            .get_user(payload.userId)
            .then(user => done(null, user))
            .catch((err: any) => done(err, false));
    }
}

/**
 * Configure passport JS server-wise subsystem;
 * @param callbackURL URL to which Google will send user's agent after consent
 * screen with access token or error message
 */
export function configure(callbackURL: string) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL,
                passReqToCallback: true,
            },
            verifyGoogleOAuth20
        )
    );
    passport.use(
        new JWTStrategy(
            {
                secretOrKey: process.env.JWT_SECRET!,
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                passReqToCallback: true,
            },
            verifyJWT
        )
    );
}

export default configure;
