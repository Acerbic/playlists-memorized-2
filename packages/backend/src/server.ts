import { Server } from "http";
import { AddressInfo } from "net";
import { Express } from "express";
import pino from "pino";

import makeApp, { AppOptions } from "./app";

type ReadyCallback = (err?: any, app?: Express, server?: Server) => void;

function main(options?: AppOptions, cb?: ReadyCallback) {
    // Set default options
    const opts = Object.assign(
        {
            // Default options
        },
        options
    );

    const ready = cb || function() {};

    const logger = pino();
    opts.logger = logger;

    const app = makeApp(opts);

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

    // Start server
    server = app.listen(Number.parseInt(opts.port, 10), opts.host, function(
        err: any
    ) {
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
