/**
 * To do with routing and responding to API requests.
 * - Requests are authorized if needed by using Authorization Bearer schema with
 *   JWT token or according to 3rd party OAuth authorization protocol (Google
 *   Auth, etc.)
 * - Requests and Responses to API are in JSON format.
 * - Error is responded both with a HTTP status code (4xx for app errors, 5xx
 *   for system errors) and in JSON object structure if possible.
 */

import { Express, Router } from "express";
import passport from "passport";
import { AppOptions } from "./app";
import auth_google from "./handlers/auth_google";
import auth_google_cb from "./handlers/auth_google_callback";
import start_session from "./handlers/start_session";
import validate_session from "./handlers/validate_session";
// import close_session from "./handlers/close_session";

export interface SuccessAPIResponse {
    success: true;
}
export interface ErrorAPIResponse {
    success: false;
    errorCode: string;
    errorMsg: string;
}

export type BaseAPIResponse = SuccessAPIResponse | ErrorAPIResponse;

// throw instances (or descendants) of this to indicate that error happened in
// app logic code, not in some system or library code.
export class APIError extends Error {
    constructor(msg?: string, source?: string | Error) {
        let src_str = undefined;
        if (typeof source === "string") {
            src_str = source;
        } else if (
            source instanceof Error ||
            (source && (source! as any).name)
        ) {
            src_str = `${source!.name} - ${source!.message}`;
        }
        super(src_str ? `${msg} | ${src_str}` : msg);
    }
}

/**
 * Configures application routes
 * @param app
 * @param opts
 */
export default function(app: Express, opts: AppOptions) {
    /**
     * OAuth protocols
     */

    // initiate login process --> will redirect to google login screen
    app.get("/auth/google", auth_google);
    // receive redirect from google oauth.
    app.get("/auth/google/callback", auth_google_cb);

    /**
     * API
     */
    // start session after google authorization
    app.get("/start_session", start_session);
    // validate existing session
    app.get("/validate_session", validate_session);
    // close session - NOT POSSIBLE since sessions aren't stored on server side,
    // being purely JWT issued tokens
    // app.post("/close_session", close_session);

    const jwt_router = Router();
    jwt_router.use(passport.authenticate("jwt", { session: false }));

    jwt_router.post("/pl/create");
    app.use(jwt_router);
}
