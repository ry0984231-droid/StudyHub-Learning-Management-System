import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const getTransporter = () => {
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass || !config.emailFrom)
        throw new Error(
            "Email configuration is missing. Check SMTP_HOST, SMTP_USER, SMTP_PASS and EMAIL_FROM."
        );

    return nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort || 587,
        secure: config.smtpSecure,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass
        }
    });
};

const sendPasswordResetOtp = async (email, otp) => {
    if (!email) throw new Error("Recipient email is required.");
    if (!otp) throw new Error("OTP is required.");

    try {
        const result = await getTransporter().sendMail({
            from: `"StudyHub" <${config.emailFrom}>`,
            to: email,
            subject: "StudyHub - Password Reset OTP",
            text: `Your StudyHub password reset OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, you can ignore this email.

Do not share this OTP with anyone.

Regards,
StudyHub Team`
        });

        console.log(`Password reset OTP sent successfully to ${email}`);
        return result;
    } catch (error) {
        console.error("Failed to send password reset email:", error.message);
        throw new Error(
            "Unable to send password reset email. Please try again later."
        );
    }
};

export { sendPasswordResetOtp };