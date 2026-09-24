import { db } from "../db/store.js";

const isAdmin = req => req.user?.role === "admin";
const isInstructorOrAdmin = req =>
    ["instructor", "admin"].includes(req.user?.role);

const error = (res, message, status = 500) =>
    res.status(status).json({ success: false, message });

const getDate = value => {
    if (!value) return null;
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
};

const monthName = i =>
    new Date(2000, i, 1).toLocaleString("en-US", { month: "short" });

const getLastSixMonths = () => {
    const now = new Date();

    return Array.from({ length: 6 }, (_, i) => {
        const date = new Date(
            now.getFullYear(),
            now.getMonth() - 5 + i,
            1
        );

        return {
            month: monthName(date.getMonth()),
            year: date.getFullYear(),
            monthIndex: date.getMonth(),
            count: 0,
            revenue: 0
        };
    });
};

const avgRating = reviews =>
    reviews.length
        ? Number(
            (
                reviews.reduce(
                    (sum, review) => sum + Number(review.rating || 0),
                    0
                ) / reviews.length
            ).toFixed(1)
        )
        : 0;

const getInstructorCourses = req =>
    db.courses.filter(
        course =>
            req.user.role === "admin" ||
            course.instructorId === req.user._id
    );

const getInstructorDashboardStats = async (req, res) => {
    try {
        if (!isInstructorOrAdmin(req))
            return error(res, "Instructor access required.", 403);

        const courses = getInstructorCourses(req);
        const courseIds = courses.map(c => c._id);

        const enrollments = db.enrollments.filter(e =>
            courseIds.includes(e.courseId)
        );

        const payments = db.payments.filter(
            p =>
                courseIds.includes(p.courseId) &&
                p.status === "success"
        );

        const reviews = db.reviews.filter(r =>
            courseIds.includes(r.courseId)
        );

        const months = getLastSixMonths();

        const monthlyItem = date =>
            months.find(
                m =>
                    m.year === date.getFullYear() &&
                    m.monthIndex === date.getMonth()
            );

        enrollments.forEach(e => {
            const date = getDate(e.enrolledAt);
            const month = date && monthlyItem(date);
            if (month) month.count++;
        });

        payments.forEach(p => {
            const date = getDate(
                p.createdAt || p.paidAt || p.paymentDate || p.date
            );
            const month = date && monthlyItem(date);
            if (month)
                month.revenue += Number(p.finalAmount || 0);
        });

        const coursePerformance = courses.map(course => {
            const ce = enrollments.filter(
                e => e.courseId === course._id
            );

            const cp = payments.filter(
                p => p.courseId === course._id
            );

            const cr = reviews.filter(
                r => r.courseId === course._id
            );

            return {
                id: course._id,
                title:
                    course.title.length > 25
                        ? `${course.title.slice(0, 25)}...`
                        : course.title,
                students: ce.length,
                rating: cr.length
                    ? avgRating(cr)
                    : Number(course.rating || 0),
                revenue: cp.reduce(
                    (sum, p) =>
                        sum + Number(p.finalAmount || 0),
                    0
                )
            };
        });

        res.status(200).json({
            success: true,
            stats: {
                totalCourses: courses.length,
                totalStudents: new Set(
                    enrollments.map(e => e.userId)
                ).size,
                totalRevenue: payments.reduce(
                    (sum, p) =>
                        sum + Number(p.finalAmount || 0),
                    0
                ),
                averageRating: avgRating(reviews),
                pendingAssignments: 0,
                quizzesTaken: db.quizAttempts.filter(a =>
                    courseIds.includes(a.courseId)
                ).length
            },
            charts: {
                monthlyEnrollments: months.map(
                    ({ month, count, revenue }) => ({
                        month,
                        count,
                        revenue
                    })
                ),
                coursePerformance
            }
        });
    } catch (err) {
        console.error(
            "getInstructorDashboardStats error:",
            err
        );
        error(
            res,
            "Error fetching instructor dashboard statistics."
        );
    }
};

const getInstructorStudents = async (req, res) => {
    try {
        if (!isInstructorOrAdmin(req))
            return error(res, "Instructor access required.", 403);

        const courses = getInstructorCourses(req);
        const courseIds = courses.map(c => c._id);

        const enrollments = db.enrollments.filter(e =>
            courseIds.includes(e.courseId)
        );

        const data = enrollments.map(e => {
            const student = db.users.find(
                u => u._id === e.userId
            );

            const course = db.courses.find(
                c => c._id === e.courseId
            );

            const attempts = db.quizAttempts.filter(
                a =>
                    a.userId === e.userId &&
                    a.courseId === e.courseId
            );

            const latest = attempts.at(-1);

            return {
                enrollmentId: e._id,
                userId: e.userId,
                studentName:
                    student?.name || "Anonymous Student",
                studentEmail:
                    student?.email || "No email available",
                studentAvatar: student?.avatar || "",
                courseId: e.courseId,
                courseTitle:
                    course?.title || "Unknown Course",
                progress: Number(
                    e.progressPercentage || 0
                ),
                isCompleted: Boolean(e.isCompleted),
                quizScore: latest
                    ? `${latest.percentage}% (${latest.passed ? "Passed" : "Failed"
                    })`
                    : "Not Attempted",
                enrolledAt: e.enrolledAt
            };
        });

        res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (err) {
        console.error(
            "getInstructorStudents error:",
            err
        );
        error(
            res,
            "Error fetching instructor students."
        );
    }
};

const getAdminMetrics = async (req, res) => {
    try {
        if (!isAdmin(req))
            return error(res, "Admin access required.", 403);

        const users = db.users;

        const studentsCount = users.filter(
            u => u.role === "student"
        ).length;

        const instructorsCount = users.filter(
            u => u.role === "instructor"
        ).length;

        const adminsCount = users.filter(
            u => u.role === "admin"
        ).length;

        const payments = db.payments.filter(
            p => p.status === "success"
        );

        const categoryMap = {};

        db.courses.forEach(course => {
            const category =
                course.category?.trim() || "Uncategorized";

            categoryMap[category] =
                (categoryMap[category] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            metrics: {
                totalUsers: users.length,
                studentsCount,
                instructorsCount,
                adminsCount,
                coursesCount: db.courses.length,
                enrollmentsCount: db.enrollments.length,
                totalRevenue: payments.reduce(
                    (sum, p) =>
                        sum + Number(p.finalAmount || 0),
                    0
                ),
                certificatesCount: db.certificates.length,
                quizzesCount: db.quizzes.length
            },
            distributions: {
                roleDistribution: [
                    {
                        name: "Students",
                        value: studentsCount
                    },
                    {
                        name: "Instructors",
                        value: instructorsCount
                    },
                    {
                        name: "Admins",
                        value: adminsCount
                    }
                ],
                categoryDistribution: Object.entries(
                    categoryMap
                )
                    .map(([name, value]) => ({
                        name,
                        value
                    }))
                    .sort((a, b) => b.value - a.value)
            }
        });
    } catch (err) {
        console.error(
            "getAdminMetrics error:",
            err
        );
        error(
            res,
            "Error fetching admin platform metrics."
        );
    }
};

const getAllUsers = async (req, res) => {
    try {
        if (!isAdmin(req))
            return error(res, "Admin access required.", 403);

        const data = db.users.map(
            ({ password, ...user }) => user
        );

        res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (err) {
        console.error(
            "getAllUsers error:",
            err
        );
        error(res, "Error fetching users.");
    }
};

const updateUserRole = async (req, res) => {
    try {
        if (!isAdmin(req))
            return error(res, "Admin access required.", 403);

        const { id } = req.params;
        const { role } = req.body;
        const roles = [
            "student",
            "instructor",
            "admin"
        ];

        if (!id)
            return error(
                res,
                "User ID is required.",
                400
            );

        if (!roles.includes(role))
            return error(
                res,
                "Invalid role. Allowed roles: student, instructor, admin.",
                400
            );

        const user = db.users.find(
            u => u._id === id
        );

        if (!user)
            return error(
                res,
                "User not found.",
                404
            );

        if (user._id === req.user._id)
            return error(
                res,
                "You cannot change your own admin role.",
                400
            );

        user.role = role;
        await db.save();

        res.status(200).json({
            success: true,
            message: `User role changed to ${role}.`,
            data: {
                userId: user._id,
                role: user.role
            }
        });
    } catch (err) {
        console.error(
            "updateUserRole error:",
            err
        );
        error(
            res,
            "Error updating user role."
        );
    }
};

const deleteUser = async (req, res) => {
    try {
        if (!isAdmin(req))
            return error(res, "Admin access required.", 403);

        const { id } = req.params;

        if (!id)
            return error(
                res,
                "User ID is required.",
                400
            );

        const index = db.users.findIndex(
            u => u._id === id
        );

        if (index === -1)
            return error(
                res,
                "User not found.",
                404
            );

        if (db.users[index]._id === req.user._id)
            return error(
                res,
                "You cannot delete your own admin account.",
                400
            );

        const deletedUser = db.users[index];

        db.users.splice(index, 1);
        await db.save();

        res.status(200).json({
            success: true,
            message: "User account deleted successfully.",
            data: {
                userId: deletedUser._id
            }
        });
    } catch (err) {
        console.error(
            "deleteUser error:",
            err
        );
        error(
            res,
            "Error deleting user."
        );
    }
};

export {
    getInstructorDashboardStats,
    getInstructorStudents,
    getAdminMetrics,
    getAllUsers,
    updateUserRole,
    deleteUser
};
