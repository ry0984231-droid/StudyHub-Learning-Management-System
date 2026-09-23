import { z } from "zod";

const registerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
    role: z.enum(["student", "instructor"]).optional()
}).passthrough();

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1).max(128)
});

const contactSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    subject: z.string().trim().max(200).optional(),
    message: z.string().trim().min(10).max(5000)
});

const validateBody = schema => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success)
        return res.status(400).json({
            success: false,
            message: "Invalid request data.",
            errors: result.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });

    req.body = result.data;
    next();
};

export {
    registerSchema,
    loginSchema,
    contactSchema,
    validateBody
};