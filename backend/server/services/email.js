import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const getTransporter = () => {
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass || !config.emailFrom) {
        throw new Error(
            "Email configuration is missing. Check SMTP_HOST, SMTP_USER, SMTP_PASS and EMAIL_FROM."
        );
    }

    return nodemailer.createTransport({
        host: config.smtpHost,
        port: Number(config.smtpPort) || 587,
        secure: config.smtpSecure === true,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
        },
    });
};

const sendPasswordResetOtp = async (email, otp) => {
    if (!email) {
        throw new Error("Recipient email is required.");
    }

    if (otp === undefined || otp === null || String(otp).length === 0) {
        throw new Error("OTP is required.");
    }

    const transporter = getTransporter();

    try {
        const result = await transporter.sendMail({
            from: {
                name: "StudyHub",
                address: config.emailFrom,
            },
            to: email,
            subject: "StudyHub - Password Reset OTP",
            text: `Your StudyHub password reset OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, you can ignore this email.

Do not share this OTP with anyone.

Regards,
StudyHub Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>StudyHub Password Reset</h2>
                    <p>Your password reset OTP is:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                    <p>If you did not request a password reset, you can safely ignore this email.</p>
                    <p>Do not share this OTP with anyone.</p>
                    <p>Regards,<br />StudyHub Team</p>
                </div>
            `,
        });

        console.log(`Password reset OTP sent to ${email}.`);
        console.log("Message ID:", result.messageId);
        return result;
    } catch (error) {
        console.error("Email delivery failed:", {
            message: error.message,
            code: error.code,
            responseCode: error.responseCode,
        });
        throw error;
    }
};

export { sendPasswordResetOtp };
