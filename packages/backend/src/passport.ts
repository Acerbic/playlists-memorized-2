/**
 * Configure authentication with Passport.js
 */

import passport from "passport";
import {
    Strategy as GoogleStrategy,
    Profile,
    VerifyCallback,
} from "passport-google-oauth20";
import { find_or_create_google_user, get_user } from "./storage";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

// User verification function
// from "profile" and with accessToken for extra data fetching,
// construct a user entity to be passed for the middleware following
// successful authentication (of fail authentication)
// In the following  middleware, see req.user field
export function verify(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback
): void {
    // fetch user entity
    find_or_create_google_user(accessToken, refreshToken, profile)
        .then(userRecord => cb(undefined, userRecord))
        .catch(error => cb(error, false));
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
            },
            verify
        )
    );
    passport.use(
        new JWTStrategy(
            {
                secretOrKey: process.env.JWT_SECRET!,
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            },
            (payload: any, done) => {
                get_user(payload.userId)
                    .then(user => done(null, user))
                    .catch(err => done(err, false));
            }
        )
    );
}

export default configure;
