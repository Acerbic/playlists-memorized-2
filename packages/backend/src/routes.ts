import { Express } from "express";
import { AppOptions } from "./app";
import auth_google from "./handlers/auth_google";
import auth_google_cb from "./handlers/auth_google_callback";
import start_session from "./handlers/start_session";
import validate_session from "./handlers/validate_session";
import close_session from "./handlers/close_session";

export interface BaseAPIResponse {
    success: boolean;
    errorCode?: string;
    errorMsg?: string;
}

/**
 * Configures application routes
 * @param app
 * @param opts
 */
export default function(app: Express, opts: AppOptions) {
    // initiate login process --> will redirect to google login screen
    app.get("/auth/google", auth_google);
    // receive redirect from google oauth.
    app.get("/auth/google/callback", auth_google_cb);

    // start session after google authorization
    app.get("/start_session", start_session);
    // validate existing session
    app.post("/validate_session", validate_session);
    // close session
    app.post("/close_session", close_session);
}
