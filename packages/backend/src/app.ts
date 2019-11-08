/**
 * Express-app, separated from active startup file (server.ts) for testing
 */

import express, { RequestHandler, ErrorRequestHandler } from "express";

// loading configs from file for dev and test environments
// set the appropriate env variables on productions in deployment pipeline!
import dotenv from "dotenv";
switch (process.env.NODE_ENV) {
    case "development":
        dotenv.config();
        break;
    case "test":
        dotenv.config({
            path: ".env.test",
        });
        break;
}

// logging
import httpErrors from "http-errors";
import { Logger } from "pino";
import pinoHttp from "pino-http";

// passport.js
import passportConfigure from "./passport";

import routes from "./routes";
import passport from "passport";
import { DbStorage } from "./storage";
import { StoragePrisma } from "./storage-prisma";

export interface AppOptions {
    host?: string;
    port?: string;
    logger?: Logger;
    storage?: DbStorage;
}

export default function makeApp(options?: AppOptions) {
    // Set default options
    const opts = Object.assign(
        {
            // Default options
            host: "backend.localhost.com",
            port: "8000",
            storage: new StoragePrisma(),
        },
        options
    );

    // Create the express app
    const app = express();
    app.set("storage", opts.storage);

    // Common middleware
    opts.logger && app.use(pinoHttp({ logger: opts.logger }));
    app.use(express.json());

    passportConfigure(`http://${opts.host}:${opts.port}/auth/google/callback`);
    app.use(passport.initialize());

    // Register routes
    // @NOTE: require here because this ensures that even syntax errors
    // or other startup related errors are caught logged and debuggable.
    // Alternatively, you could setup external log handling for startup
    // errors and handle them outside the node process.  I find this is
    // better because it works out of the box even in local development.
    routes(app, opts);

    // Common error handlers
    app.use(<RequestHandler>function fourOhFourHandler(req, res, next) {
        next(httpErrors(404, `Route not found: ${req.url}`));
    });
    app.use(<ErrorRequestHandler>(
        function fiveHundredHandler(err, req, res, next) {
            if (err.status >= 500) {
                opts.logger && opts.logger.error(err);
            }
            res.status(err.status || 500).json({
                messages: [
                    {
                        code: err.code || "InternalServerError",
                        message: err.message,
                    },
                ],
            });
        }
    ));

    return app;
}
