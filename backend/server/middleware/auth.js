import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { db } from "../db/store.js";

const protect = (req, res, next) => {
    const token = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;

    if (!token)
        return res.status(401).json({
            success: false,
            message: "Not authorized to access this route. Please log in."
        });

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = db.users.find(u => u._id === decoded.id);

        if (!user)
            return res.status(401).json({
                success: false,
                message: "User belonging to this token no longer exists."
            });

        req.user = user;
        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Authentication token is invalid or expired."
        });
    }
};

const optionalProtect = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) return next();
    return protect(req, res, next);
};

const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
        return res.status(403).json({
            success: false,
            message: `Role (${req.user?.role || "guest"}) is not authorized to access this resource.`
        });

    next();
};

export { protect, optionalProtect, authorize };
