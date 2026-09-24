import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });


export const config = {
    port: Number(process.env.PORT || 3000),

    nodeEnv:
        process.env.NODE_ENV || "development",

    appName:
        "StudyHub — Learning Management System",

    clientUrl:
        process.env.CLIENT_URL ||
        process.env.APP_URL ||
        "http://localhost:3000",

    baseUrl:
        process.env.APP_URL ||
        "http://localhost:3000",

    jwtSecret:
        process.env.JWT_SECRET || "",
    mongoUri:
        process.env.MONGODB_URI || "",

    mongoDbName:
        process.env.MONGODB_DB_NAME ||
        "studyhub",

    smtpHost:
        process.env.SMTP_HOST || "",

    smtpPort:
        Number(process.env.SMTP_PORT || 587),

    smtpUser:
        process.env.SMTP_USER || "",

    smtpPass:
        process.env.SMTP_PASS || "",

    smtpSecure:
        String(
            process.env.SMTP_SECURE || "false"
        ).toLowerCase() === "true",

    emailFrom:
        process.env.EMAIL_FROM ||
        process.env.SMTP_USER ||
        "",
    razorpayKeyId:
        process.env.RAZORPAY_KEY_ID || "",

    razorpayKeySecret:
        process.env.RAZORPAY_KEY_SECRET || "",
};
