import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

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

    // Security headers
    app.use(
        helmet({
            contentSecurityPolicy:
                config.nodeEnv === "production"
                    ? undefined
                    : false,
        })
    );

    // CORS
    const allowedOrigins = [
        config.clientUrl,
        "http://localhost:5173",
    ].filter(Boolean);

    app.use(
        cors({
            origin(origin, callback) {
                // Allow requests without Origin header
                // such as Postman/server-to-server requests
                if (!origin) {
                    return callback(null, true);
                }

                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }

                console.error(
                    `CORS blocked origin: ${origin}`
                );

                return callback(
                    new Error("Not allowed by CORS")
                );
            },
            credentials: true,
        })
    );

    // Rate limiting for API
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

    // Body parsers
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

    // API health check
    app.get("/", (_req, res) => {
        res.status(200).json({
            success: true,
            message: "StudyHub API is running",
        });
    });

    // API routes
    app.use("/api", apiRouter);

    // 404 handler
    app.use(notFound);

    // Error handler
    app.use(errorHandler);

    // Start server
    const server = app.listen(
        PORT,
        "0.0.0.0",
        () => {
            console.log(
                `StudyHub Server running on http://0.0.0.0:${PORT}`
            );

            console.log(
                `Client URL: ${config.clientUrl}`
            );

            console.log(
                "Uploaded videos are delivered through enrollment-checked lesson endpoints."
            );
        }
    );

    // Graceful shutdown
    const shutdown = async () => {
        console.log(
            "\nShutting down StudyHub server..."
        );

        server.close();

        await db.close();

        process.exit(0);
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
}

startServer().catch((err) => {
    console.error(
        "Failed to start StudyHub server:",
        err
    );

    process.exitCode = 1;
});