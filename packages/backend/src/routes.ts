import { Express } from "express";
import validate_session from "./handlers/validate_session";
import auth_google from "./handlers/auth_google";
import auth_google_cb from "./handlers/auth_google_callback";
import { AppOptions } from "./app";

export default function(app: Express, opts: AppOptions) {
    // initiate login process --> will redirect to google login screen
    app.get("/auth/google", auth_google);
    // Setup routes, middleware, and handlers
    app.post("/validate_session", validate_session);
    // receive redirect from google oauth.
    app.get("/auth/google/callback", auth_google_cb);
}
