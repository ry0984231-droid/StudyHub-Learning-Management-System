import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import { apiRouter } from "./server/routes/api.js";
import { config } from "./server/config/config.js";
import { db } from "./server/db/store.js";
import {
    errorHandler,
    notFound,
} from "./server/middleware/errorHandler.js";

async function startServer() {

    if (
        !config.jwtSecret ||
        config.jwtSecret.length < 32
    ) {
        throw new Error(
            "JWT_SECRET must be set to a random value of at least 32 characters."
        );
    }

    await db.connect();

    const app = express();
    const PORT = config.port;

    app.disable("x-powered-by");

    app.use(
        helmet({
            contentSecurityPolicy:
                config.nodeEnv === "production"
                    ? undefined
                    : false,
        })
    );


    app.use(
        cors({
            origin: config.clientUrl,
            credentials: true,
        })
    );

    app.use(
        "/api",
        rateLimit({
            windowMs: 15 * 60 * 1000,
            limit: 300,
            standardHeaders: "draft-8",
            legacyHeaders: false,
            message: {
                success: false,
                message:
                    "Too many API requests. Please try again later.",
            },
        })
    );


    app.use(
        express.json({
            limit: "1mb",
        })
    );

    app.use(
        express.urlencoded({
            extended: true,
            limit: "15mb",
        })
    );

    app.use("/api", apiRouter);

    if (config.nodeEnv !== "production") {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
            server: {
                middlewareMode: true,
            },
            appType: "spa",
        });

        app.use(vite.middlewares);
    }

    else {
        const distPath = path.join(
            process.cwd(),
            "dist"
        );

        app.use(
            express.static(distPath)
        );

        app.get("*", (_req, res) => {
            res.sendFile(
                path.join(
                    distPath,
                    "index.html"
                )
            );
        });
    }
    app.use(notFound);
    app.use(errorHandler);
    const server = app.listen(
        PORT,
        "0.0.0.0",
        () => {
            console.log(
                `StudyHub Server running on http://0.0.0.0:${PORT}`
            );

            console.log(
                "Uploaded videos are delivered through enrollment-checked lesson endpoints."
            );
        }
    );
    const shutdown = async () => {
        console.log(
            "\nShutting down StudyHub server..."
        );

        server.close();

        await db.close();

        process.exit(0);
    };

    process.once(
        "SIGINT",
        shutdown
    );

    process.once(
        "SIGTERM",
        shutdown
    );
}
startServer().catch((err) => {
    console.error(
        "Failed to start StudyHub server:",
        err
    );
    process.exitCode = 1;
});
