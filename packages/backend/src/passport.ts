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
import { find_or_create_google_user, Storage } from "./storage";
import {
    Strategy as JWTStrategy,
    ExtractJwt,
    VerifiedCallback as VerifyCB_JWT,
} from "passport-jwt";

// User verification function
// from "profile" and with accessToken for extra data fetching,
// construct a user entity to be passed for the middleware following
// successful authentication (of fail authentication)
// In the following  middleware, see req.user field
export function verify(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCB_GoogleOAuth20
): void {
    // fetch user entity
    const storage: Storage = req.app.get("storage");
    if (!storage) {
        done(new Error("Express app must have a storage initiated"), false);
    } else {
        find_or_create_google_user(storage, accessToken, refreshToken, profile)
            .then(userRecord => done(undefined, userRecord))
            .catch(error => done(error, false));
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
            verify
        )
    );
    passport.use(
        new JWTStrategy(
            {
                secretOrKey: process.env.JWT_SECRET!,
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                passReqToCallback: true,
            },
            (req: Request, payload: any, done: VerifyCB_JWT) => {
                const storage: Storage = req.app.get("storage");
                if (!storage) {
                    done(
                        new Error("Express app must have a storage initiated"),
                        false
                    );
                } else {
                    storage
                        .get_user(payload.userId)
                        .then(user => done(null, user))
                        .catch(err => done(err, false));
                }
            }
        )
    );
}

export default configure;
