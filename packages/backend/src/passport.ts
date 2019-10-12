/**
 * Initialize authentication with passport
 */

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

/**
 * Initialize passport JS server-wise subsystem;
 * @param callbackURL URL to which Google will send user's agent after consent
 * screen with access token or error message
 */
export function initialize(callbackURL: string) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL,
            },
            // User verification function
            // from "profile" and with accessToken for extra data fetching,
            // construct a user entity to be passed for the middleware following
            // successful authentication (of fail authentication)
            // In the following  middleware, see req.user field
            function(accessToken, refreshToken, profile, cb) {
                return cb(undefined, "usr-id");
                // User.findOrCreate({ googleId: profile.id }, function(
                //     err,
                //     user
                // ) {
                //     return cb(err, user);
                // });
            }
        )
    );

    passport.initialize();
}

export default initialize;
