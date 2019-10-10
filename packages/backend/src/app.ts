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
import passportInitialize from "./passport";

import routes from "./routes";

export interface AppOptions {
    host: string;
    port: string;
    logger?: Logger;
}

export default function makeApp(options?: AppOptions) {
    // Set default options
    const opts = Object.assign(
        {
            // Default options
        },
        options
    );

    // Create the express app
    const app = express();

    // Common middleware
    // app.use(/* ... */)
    opts.logger && app.use(pinoHttp({ logger: opts.logger }));
    app.use(
        express.json(/*{
            // strict: false,
            verify: function(req, res, buf, encoding) {
                if (buf && buf.length) {
                    (req as any).rawBody = buf.toString(encoding || "utf8");
                }
            },
        }*/)
    );

    passportInitialize(
        "http://backend.localhost.com:8000/auth/google/callback"
    );

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
