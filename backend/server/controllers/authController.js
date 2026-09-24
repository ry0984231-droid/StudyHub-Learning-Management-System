import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomInt } from "crypto";
import { config } from "../config/config.js";
import { db } from "../db/store.js";
import { sendPasswordResetOtp } from "../services/email.js";

const otpStore = {};

const send = (res, status, message, data = {}) =>
    res.status(status).json({ success: status < 400, message, ...data });

const safe = ({ password, ...user }) => user;

const token = user =>
    jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name
        },
        config.jwtSecret,
        { expiresIn: "7d" }
    );

const findUser = email =>
    db.users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );

const hash = otp =>
    createHash("sha256").update(otp).digest("hex");

const checkOtp = (email, otp) => {
    const data = otpStore[email.toLowerCase()];

    if (
        !data ||
        data.expiresAt < Date.now() ||
        data.attempts >= 5
    ) return false;

    data.attempts++;

    return data.otpHash === hash(otp);
};

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            collegeEmail,
            password,
            confirmPassword,
            dateOfBirth,
            role
        } = req.body;

        if (!name || !email || !password)
            return send(
                res,
                400,
                "Please provide all required fields (name, email, password)."
            );

        if (password !== confirmPassword)
            return send(res, 400, "Passwords do not match.");

        if (findUser(email))
            return send(
                res,
                400,
                "A user with this email address already exists."
            );

        const user = {
            _id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            name,
            email: email.toLowerCase(),
            collegeEmail: collegeEmail || "",
            password: await bcrypt.hash(password, 10),
            role: role === "instructor" ? "instructor" : "student",
            dateOfBirth: dateOfBirth || "",
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            bio: "",
            phone: "",
            location: "",
            createdAt: new Date().toISOString(),
            isVerified: true,
            wishlist: []
        };

        db.users.push(user);

        db.notifications.push({
            _id: `notif_${Date.now()}`,
            userId: user._id,
            type: "system",
            title: "Welcome to StudyHub!",
            message: `Welcome, ${user.name}! Start by exploring our top university courses.`,
            link: "/courses",
            read: false,
            createdAt: new Date().toISOString()
        });

        await db.save();

        send(res, 201, "Registration successful!", {
            token: token(user),
            user: safe(user)
        });
    } catch (err) {
        if (err?.code === 11000)
            return send(res, 409, "A user with this email address already exists.");
        send(
            res,
            500,
            err?.message || "Server error during registration."
        );
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return send(
                res,
                400,
                "Please provide email and password."
            );

        const user = findUser(email);

        if (
            !user?.password ||
            !(await bcrypt.compare(password, user.password))
        )
            return send(
                res,
                401,
                "Invalid email or password credentials."
            );

        send(res, 200, "Login successful!", {
            token: token(user),
            user: safe(user)
        });
    } catch (err) {
        send(
            res,
            500,
            err?.message || "Server error during login."
        );
    }
};

const getMe = (req, res) => {
    if (!req.user)
        return send(res, 401, "Not authenticated.");

    send(res, 200, "User authenticated.", {
        user: safe(req.user)
    });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email)
        return send(
            res,
            400,
            "Please provide your email address."
        );

    const user = findUser(email);

    if (!user)
        return send(
            res,
            200,
            "If that email exists in our system, a 6-digit verification code has been sent."
        );

    const key = email.toLowerCase();
    const otp = randomInt(100000, 1000000).toString();

    otpStore[key] = {
        otpHash: hash(otp),
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0
    };

    try {
        await sendPasswordResetOtp(user.email, otp);

        send(
            res,
            200,
            "A 6-digit verification code has been sent to your email address."
        );
    } catch (err) {
        delete otpStore[key];

        send(
            res,
            503,
            err?.message ||
            "Unable to send the verification email. Please try again later."
        );
    }
};

const verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp)
        return send(
            res,
            400,
            "Email and OTP code are required."
        );

    if (!checkOtp(email, otp))
        return send(
            res,
            400,
            "The verification code is invalid or has expired."
        );

    send(
        res,
        200,
        "OTP code verified successfully."
    );
};

const resetPassword = async (req, res) => {
    const {
        email,
        otp,
        newPassword,
        confirmPassword
    } = req.body;

    if (!email || !otp || !newPassword)
        return send(
            res,
            400,
            "Missing required parameters."
        );

    if (newPassword.length < 8)
        return send(
            res,
            400,
            "Password must contain at least 8 characters."
        );

    if (newPassword !== confirmPassword)
        return send(
            res,
            400,
            "Passwords do not match."
        );

    if (!checkOtp(email, otp))
        return send(
            res,
            400,
            "Invalid or expired OTP session."
        );

    const user = findUser(email);

    if (!user)
        return send(res, 404, "User not found.");

    user.password = await bcrypt.hash(newPassword, 10);

    delete otpStore[email.toLowerCase()];

    await db.save();

    send(
        res,
        200,
        "Password updated successfully. You may now log in."
    );
};

const updateProfile = async (req, res) => {
    if (!req.user)
        return send(res, 401, "Not authenticated.");

    const {
        name,
        bio,
        phone,
        location,
        avatar,
        collegeEmail,
        dateOfBirth
    } = req.body;

    const user = db.users.find(
        u => u._id === req.user._id
    );

    if (!user)
        return send(res, 404, "User not found.");

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (avatar) user.avatar = avatar;
    if (collegeEmail !== undefined)
        user.collegeEmail = collegeEmail;
    if (dateOfBirth !== undefined)
        user.dateOfBirth = dateOfBirth;

    await db.save();

    send(res, 200, "Profile updated successfully!", {
        user: safe(user)
    });
};

const changePassword = async (req, res) => {
    if (!req.user)
        return send(res, 401, "Not authenticated.");

    const {
        currentPassword,
        newPassword,
        confirmPassword
    } = req.body;

    if (!currentPassword || !newPassword)
        return send(
            res,
            400,
            "Current and new password required."
        );

    if (newPassword !== confirmPassword)
        return send(
            res,
            400,
            "New passwords do not match."
        );

    const user = db.users.find(
        u => u._id === req.user._id
    );

    if (!user?.password)
        return send(res, 404, "User not found.");

    if (
        !(await bcrypt.compare(
            currentPassword,
            user.password
        ))
    )
        return send(
            res,
            400,
            "Current password does not match."
        );

    user.password = await bcrypt.hash(newPassword, 10);

    await db.save();

    send(
        res,
        200,
        "Password changed successfully!"
    );
};

export {
    register,
    login,
    getMe,
    forgotPassword,
    verifyOtp,
    resetPassword,
    updateProfile,
    changePassword
};
