import { Express } from "express";
import simple from "./handlers/simple";

interface AppOptions {
    host: string;
    port: string;
}

export default function(app: Express, opts: AppOptions) {
    // Setup routes, middleware, and handlers
    app.get("/", simple);
}
