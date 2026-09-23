import { Router } from "express";
import * as auth from "../controllers/authController.js";
import * as course from "../controllers/courseController.js";
import * as lesson from "../controllers/lessonController.js";
import * as enrollment from "../controllers/enrollmentController.js";
import * as quiz from "../controllers/quizController.js";
import * as payment from "../controllers/paymentController.js";
import * as certificate from "../controllers/certificateController.js";
import * as review from "../controllers/reviewController.js";
import * as wishlist from "../controllers/wishlistController.js";
import * as notification from "../controllers/notificationController.js";
import * as admin from "../controllers/adminController.js";
import { protect, optionalProtect, authorize } from "../middleware/auth.js";
import {
    contactSchema,
    loginSchema,
    registerSchema,
    validateBody
} from "../middleware/validate.js";
import { uploadVideo } from "../middleware/upload.js";
import { db } from "../db/store.js";

export const apiRouter = Router();

// Health
apiRouter.get("/health", (req, res) =>
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        platform: "StudyHub LMS"
    })
);

// Auth
apiRouter.post("/auth/register", validateBody(registerSchema), auth.register);
apiRouter.post("/auth/login", validateBody(loginSchema), auth.login);
apiRouter.get("/auth/me", protect, auth.getMe);
apiRouter.post("/auth/forgot-password", auth.forgotPassword);
apiRouter.post("/auth/verify-otp", auth.verifyOtp);
apiRouter.post("/auth/reset-password", auth.resetPassword);
apiRouter.put("/auth/profile", protect, auth.updateProfile);
apiRouter.put("/auth/change-password", protect, auth.changePassword);

// Courses
apiRouter.get("/home/overview", course.getHomeOverview);
apiRouter.get("/courses", course.getCourses);
apiRouter.get("/courses/categories", course.getCourseCategories);
apiRouter.get(
    "/instructor/courses",
    protect,
    authorize("instructor", "admin"),
    course.getInstructorCourses
);
apiRouter.get("/courses/:id", optionalProtect, course.getCourseById);
apiRouter.post(
    "/courses",
    protect,
    authorize("instructor", "admin"),
    course.createCourse
);
apiRouter.put(
    "/courses/:id",
    protect,
    authorize("instructor", "admin"),
    course.updateCourse
);
apiRouter.delete(
    "/courses/:id",
    protect,
    authorize("instructor", "admin"),
    course.deleteCourse
);

// Lessons
apiRouter.get("/lessons/course/:courseId", protect, lesson.getLessonsByCourse);
apiRouter.get("/lessons/:id", protect, lesson.getLessonById);
apiRouter.get("/lessons/:id/video", optionalProtect, lesson.streamLessonVideo);
apiRouter.post(
    "/lessons",
    protect,
    authorize("instructor", "admin"),
    uploadVideo.single("video"),
    lesson.createLesson
);
apiRouter.put(
    "/lessons/reorder",
    protect,
    authorize("instructor", "admin"),
    lesson.reorderLessons
);
apiRouter.put(
    "/lessons/:id",
    protect,
    authorize("instructor", "admin"),
    lesson.updateLesson
);
apiRouter.delete(
    "/lessons/:id",
    protect,
    authorize("instructor", "admin"),
    lesson.deleteLesson
);

// Enrollments
apiRouter.get("/enrollments/mine", protect, enrollment.getMyEnrollments);
apiRouter.get(
    "/enrollments/check/:courseId",
    protect,
    enrollment.checkEnrollment
);
apiRouter.post(
    "/enrollments/enroll",
    protect,
    authorize("student"),
    enrollment.enrollCourse
);
apiRouter.post(
    "/enrollments/complete-lesson",
    protect,
    enrollment.completeLesson
);
apiRouter.get(
    "/enrollments/activity",
    protect,
    enrollment.getMyLearningActivity
);

// Quizzes
apiRouter.get("/quizzes", protect, quiz.getQuizzes);
apiRouter.get("/quizzes/:id", protect, quiz.getQuizById);
apiRouter.post("/quizzes/:id/submit", protect, quiz.submitQuiz);
apiRouter.get("/quizzes/:id/results", protect, quiz.getQuizResults);
apiRouter.post(
    "/quizzes",
    protect,
    authorize("instructor", "admin"),
    quiz.createQuiz
);
apiRouter.put(
    "/quizzes/:id",
    protect,
    authorize("instructor", "admin"),
    quiz.updateQuiz
);
apiRouter.delete(
    "/quizzes/:id",
    protect,
    authorize("instructor", "admin"),
    quiz.deleteQuiz
);

// Payments
apiRouter.post("/payments/create-order", protect, payment.createOrder);
apiRouter.post("/payments/verify", protect, payment.verifyPayment);
apiRouter.get("/payments/history", protect, payment.getPaymentHistory);
apiRouter.get(
    "/admin/payments",
    protect,
    authorize("admin"),
    payment.getAdminPaymentHistory
);

// Certificates
apiRouter.get(
    "/certificates/my",
    protect,
    certificate.getMyCertificates
);
apiRouter.post(
    "/certificates/generate",
    protect,
    certificate.generateCertificate
);
apiRouter.get(
    "/certificates/verify/:certificateId",
    certificate.verifyCertificate
);
apiRouter.get(
    "/certificates/:id",
    protect,
    certificate.getCertificateById
);

// Reviews
apiRouter.get(
    "/reviews/course/:courseId",
    review.getCourseReviews
);
apiRouter.post("/reviews", protect, review.addReview);

// Wishlist
apiRouter.get("/wishlist", protect, wishlist.getWishlist);
apiRouter.post(
    "/wishlist/toggle/:courseId",
    protect,
    wishlist.toggleWishlist
);

// Notifications
apiRouter.get(
    "/notifications",
    protect,
    notification.getNotifications
);
apiRouter.put(
    "/notifications/read-all",
    protect,
    notification.markAllNotificationsRead
);
apiRouter.put(
    "/notifications/:id/read",
    protect,
    notification.markNotificationRead
);

// Instructor
apiRouter.get(
    "/instructor/stats",
    protect,
    authorize("instructor", "admin"),
    admin.getInstructorDashboardStats
);
apiRouter.get(
    "/instructor/students",
    protect,
    authorize("instructor", "admin"),
    admin.getInstructorStudents
);

// Admin
apiRouter.get(
    "/admin/metrics",
    protect,
    authorize("admin"),
    admin.getAdminMetrics
);
apiRouter.get(
    "/admin/users",
    protect,
    authorize("admin"),
    admin.getAllUsers
);
apiRouter.put(
    "/admin/users/:id/role",
    protect,
    authorize("admin"),
    admin.updateUserRole
);
apiRouter.delete(
    "/admin/users/:id",
    protect,
    authorize("admin"),
    admin.deleteUser
);

// Contact
apiRouter.post(
    "/contact",
    validateBody(contactSchema),
    async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;

            if (!name || !email || !message)
                return res.status(400).json({
                    success: false,
                    message: "Please fill out all required contact fields."
                });

            db.contactMessages.push({
                _id: `contact_${Date.now()}`,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                subject: String(subject || "General inquiry").trim(),
                message: message.trim(),
                createdAt: new Date().toISOString(),
                status: "open"
            });

            await db.save();

            res.status(201).json({
                success: true,
                message:
                    "Your message has been received. Our support team will respond by email."
            });
        } catch (err) {
            console.error("Contact Form Error:", err);
            res.status(500).json({
                success: false,
                message: "Failed to submit contact form."
            });
        }
    }
);
