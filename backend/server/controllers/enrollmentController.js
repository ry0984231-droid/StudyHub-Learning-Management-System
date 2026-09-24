import { db } from "../db/store.js";
import {
    createCertificate,
    getPassedRequiredAssessments
} from "./certificateController.js";

const auth = (req, res) => {
    if (req.user) return true;
    res.status(401).json({
        success: false,
        message: "Not authenticated"
    });
    return false;
};

const getMyEnrollments = async (req, res) => {
    try {
        if (!auth(req, res)) return;

        const enrollments = db.enrollments.filter(
            e => e.userId === req.user._id
        );

        const data = enrollments.map(enrollment => {
            const course = db.courses.find(
                c => c._id === enrollment.courseId
            );

            const lessons = db.lessons
                .filter(l => l.courseId === enrollment.courseId)
                .sort((a, b) => a.order - b.order);

            const lastLesson = enrollment.lastAccessedLessonId
                ? lessons.find(
                    l => l._id === enrollment.lastAccessedLessonId
                ) || lessons[0]
                : lessons[0];

            return {
                ...enrollment,
                course,
                totalLessons: lessons.length,
                lastLessonTitle:
                    lastLesson?.title || "Introduction",
                lastLessonId: lastLesson?._id || ""
            };
        });

        res.json({
            success: true,
            data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching user enrollments."
        });
    }
};

const checkEnrollment = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!req.user)
            return res.json({
                success: true,
                isEnrolled: false
            });

        const enrollment = db.enrollments.find(
            e =>
                e.userId === req.user._id &&
                e.courseId === courseId
        );

        res.json({
            success: true,
            isEnrolled: !!enrollment,
            enrollment: enrollment || null
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error checking enrollment."
        });
    }
};

const enrollCourse = async (req, res) => {
    try {
        if (!auth(req, res)) return;

        const { courseId } = req.body;
        const course = db.courses.find(
            c => c._id === courseId
        );

        if (!course)
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });

        if (course.status !== "published")
            return res.status(400).json({
                success: false,
                message:
                    "This course is not currently available for enrollment."
            });

        const originalPrice = Number(course.price ?? 0);
        const price = Number(course.discountPrice ?? course.price ?? 0);

        if (!Number.isFinite(originalPrice) || !Number.isFinite(price) ||
            originalPrice < 0 || price < 0 || price > originalPrice)
            return res.status(400).json({
                success: false,
                message: "This course has an invalid price. Contact support."
            });

        if (price > 0) {
            const paid = db.payments.some(
                payment =>
                    payment.userId === req.user._id &&
                    payment.courseId === courseId &&
                    payment.status === "success"
            );

            if (!paid)
                return res.status(402).json({
                    success: false,
                    message:
                        "This paid course requires a successful payment before enrollment."
                });
        }

        const existing = db.enrollments.find(
            e =>
                e.userId === req.user._id &&
                e.courseId === courseId
        );

        if (existing)
            return res.json({
                success: true,
                message: "Already enrolled in this course.",
                enrollment: existing
            });

        const firstLesson = db.lessons
            .filter(l => l.courseId === courseId)
            .sort((a, b) => a.order - b.order)[0];

        const enrollment = {
            _id: `enr_${Date.now()}`,
            userId: req.user._id,
            courseId: course._id,
            progressPercentage: 0,
            completedLessons: [],
            lastAccessedLessonId: firstLesson?._id,
            enrolledAt: new Date().toISOString(),
            isCompleted: false
        };

        db.enrollments.push(enrollment);
        course.studentsCount =
            (course.studentsCount || 0) + 1;

        db.studyEvents.push({
            _id: `event_${Date.now()}`,
            userId: req.user._id,
            type: "enrolled",
            occurredAt: new Date().toISOString()
        });

        db.notifications.push({
            _id: `notif_${Date.now()}`,
            userId: req.user._id,
            type: "new_course",
            title: "Course Enrollment Confirmed!",
            message: `You have successfully enrolled in "${course.title}". Start learning now!`,
            link: `/learn/${course._id}`,
            read: false,
            createdAt: new Date().toISOString()
        });

        await db.save();

        res.status(201).json({
            success: true,
            message: "Enrolled successfully!",
            enrollment
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error enrolling in course."
        });
    }
};

const completeLesson = async (req, res) => {
    try {
        if (!auth(req, res)) return;

        const { courseId, lessonId } = req.body;

        if (!courseId || !lessonId)
            return res.status(400).json({
                success: false,
                message:
                    "Course ID and lesson ID are required."
            });

        const lesson = db.lessons.find(
            l =>
                l._id === lessonId &&
                l.courseId === courseId
        );

        if (!lesson)
            return res.status(404).json({
                success: false,
                message: "Lesson not found for this course."
            });

        const enrollment = db.enrollments.find(
            e =>
                e.userId === req.user._id &&
                e.courseId === courseId
        );

        if (!enrollment)
            return res.status(403).json({
                success: false,
                message:
                    "You must be enrolled in this course."
            });

        if (!enrollment.completedLessons.includes(lessonId)) {
            enrollment.completedLessons.push(lessonId);

            db.studyEvents.push({
                _id: `event_${Date.now()}_${Math.random()
                    .toString(36)
                    .slice(2, 7)}`,
                userId: req.user._id,
                type: "lesson_completed",
                occurredAt: new Date().toISOString()
            });
        }

        enrollment.lastAccessedLessonId = lessonId;

        const totalLessons = db.lessons.filter(
            l => l.courseId === courseId
        ).length;

        const progress = totalLessons
            ? Math.min(
                100,
                Math.round(
                    (enrollment.completedLessons.length /
                        totalLessons) *
                    100
                )
            )
            : 0;

        enrollment.progressPercentage = progress;

        let certificateGenerated = null;

        if (progress >= 100) {
            enrollment.isCompleted = true;
            enrollment.completedAt =
                enrollment.completedAt ||
                new Date().toISOString();

            const course = db.courses.find(
                c => c._id === courseId
            );

            if (
                course &&
                !getPassedRequiredAssessments(
                    req.user._id,
                    courseId
                )
            ) {
                db.notifications.push({
                    _id: `notif_${Date.now()}_${Math.random()
                        .toString(36)
                        .slice(2, 7)}`,
                    userId: req.user._id,
                    type: "quiz_reminder",
                    title: "Assessment Required",
                    message: `You completed "${course.title}". Pass all required assessments to receive your certificate.`,
                    link: `/quiz`,
                    read: false,
                    createdAt: new Date().toISOString()
                });
            } else if (course) {
                const existing = db.certificates.find(
                    c =>
                        c.userId === req.user._id &&
                        c.courseId === courseId
                );

                if (!existing) {
                    certificateGenerated = createCertificate(
                        req.user,
                        course
                    );

                    db.certificates.push(
                        certificateGenerated
                    );

                    db.notifications.push({
                        _id: `notif_${Date.now()}_${Math.random()
                            .toString(36)
                            .slice(2, 7)}`,
                        userId: req.user._id,
                        type: "certificate_generated",
                        title: "Certificate Generated",
                        message: `Your certificate for "${course.title}" is ready.`,
                        link: "/student-certificates",
                        read: false,
                        createdAt: new Date().toISOString()
                    });
                }
            }
        }

        await db.save();

        res.json({
            success: true,
            message: certificateGenerated
                ? "Lesson completed and certificate generated."
                : "Lesson marked as completed.",
            enrollment,
            progressPercentage: progress,
            certificate: certificateGenerated
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error updating progress."
        });
    }
};

const getMyLearningActivity = async (req, res) => {
    if (!auth(req, res)) return;

    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 6);

        const days = Array.from(
            { length: 7 },
            (_, index) => {
                const date = new Date(start);
                date.setDate(start.getDate() + index);

                return {
                    key: date.toISOString().slice(0, 10),
                    day: date.toLocaleDateString(
                        "en-US",
                        { weekday: "short" }
                    ),
                    lessons: 0
                };
            }
        );

        db.studyEvents
            .filter(
                event =>
                    event.userId === req.user._id &&
                    event.type === "lesson_completed"
            )
            .forEach(event => {
                const bucket = days.find(
                    day =>
                        day.key === event.occurredAt.slice(0, 10)
                );

                if (bucket) bucket.lessons++;
            });

        let streak = 0;

        for (let offset = 0; offset < 365; offset++) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - offset);

            const key = date.toISOString().slice(0, 10);

            const active = db.studyEvents.some(
                event =>
                    event.userId === req.user._id &&
                    event.type === "lesson_completed" &&
                    event.occurredAt.slice(0, 10) === key
            );

            if (active) streak++;
            else if (offset > 0) break;
        }

        res.json({
            success: true,
            data: days,
            streakDays: streak,
            completedThisWeek: days.reduce(
                (sum, day) => sum + day.lessons,
                0
            )
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching learning activity."
        });
    }
};

export {
    getMyEnrollments,
    checkEnrollment,
    enrollCourse,
    completeLesson,
    getMyLearningActivity
};
