import { Express } from "express";
import simple from "./handlers/simple";
import { AppOptions } from "./app";

export default function(app: Express, opts: AppOptions) {
    // Setup routes, middleware, and handlers
    app.get("/", simple);
}
