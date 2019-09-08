import { Server } from "http";
import { AddressInfo } from "net";
import express, { RequestHandler, ErrorRequestHandler } from "express";
import httpErrors from "http-errors";
import pino from "pino";
import pinoHttp from "pino-http";

import routes from "./routes";

function main(options?: any, cb?: any) {
    // Set default options
    const ready = cb || function() {};
    const opts = Object.assign(
        {
            // Default options
        },
        options
    );

    const logger = pino();

    // Server state
    let server: Server;
    let serverStarted = false;
    let serverClosing = false;

    // Setup error handling
    function unhandledError(err: any) {
        // Log the errors
        logger.error(err);

        // Only clean up once
        if (serverClosing) {
            return;
        }
        serverClosing = true;

        // If server has started, close it down
        if (serverStarted) {
            server.close(function() {
                process.exit(1);
            });
        }
    }
    process.on("uncaughtException", unhandledError);
    process.on("unhandledRejection", unhandledError);

    // Create the express app
    const app = express();

    // Common middleware
    // app.use(/* ... */)
    app.use(pinoHttp({ logger }));

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
                logger.error(err);
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

    // Start server
    server = app.listen(opts.port, opts.host, function(err: any) {
        if (err) {
            return ready(err, app, server);
        }

        // If some other error means we should close
        if (serverClosing) {
            return ready(new Error("Server was closed before it could start"));
        }

        serverStarted = true;
        const addr: AddressInfo = server.address() as AddressInfo;
        if (addr && addr.port !== undefined)
            logger.info(
                `Started at ${opts.host || addr.address || "localhost"}:${
                    addr!.port
                }`
            );
        ready(err, app, server);
    });
}

main({
    host: "localhost",
    port: "8000",
});
