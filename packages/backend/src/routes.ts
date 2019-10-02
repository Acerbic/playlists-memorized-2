import { Express } from "express";
import simple from "./handlers/simple";
import validate_session from "./handlers/validate_session";
import { AppOptions } from "./app";

export default function(app: Express, opts: AppOptions) {
    // Setup routes, middleware, and handlers
    app.get("/", simple);
    app.post("/validate_session", validate_session);
}
