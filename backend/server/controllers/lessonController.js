import { db } from "../db/store.js";
import path from "node:path";
import fs from "node:fs";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { videoUploadDir } from "../middleware/upload.js";

const canManageCourse = (req, courseId) => {
    const course = db.courses.find(c => c._id === courseId);
    return !!course && (
        req.user?.role === "admin" ||
        course.instructorId === req.user?._id
    );
};

const lessonForResponse = lesson => ({
    ...lesson,
    videoUrl: lesson.videoType === "local"
        ? `/api/lessons/${encodeURIComponent(lesson._id)}/video`
        : lesson.videoUrl
});

const getLessonsByCourse = async (req, res) => {
    try {
        if (!canManageCourse(req, req.params.courseId))
            return res.status(403).json({
                success: false,
                message: "Only the course instructor or an admin can manage its lessons."
            });

        const lessons = db.lessons
            .filter(l => l.courseId === req.params.courseId)
            .sort((a, b) => a.order - b.order)
            .map(lessonForResponse);

        res.json({
            success: true,
            count: lessons.length,
            data: lessons
        });
    } catch (err) {
        console.error("Get Lessons Error:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching lessons."
        });
    }
};

const getLessonById = async (req, res) => {
    try {
        const lesson = db.lessons.find(l => l._id === req.params.id);

        if (!lesson)
            return res.status(404).json({
                success: false,
                message: "Lesson not found."
            });

        const course = db.courses.find(c => c._id === lesson.courseId);
        if (!course)
            return res.status(404).json({ success: false, message: "Course not found." });

        const canManage = canManageCourse(req, lesson.courseId);
        if (course.status !== "published" && !canManage)
            return res.status(404).json({ success: false, message: "Lesson not found." });

        const hasAccess = canManage ||
            (course.status === "published" && lesson.isFreePreview) ||
            db.enrollments.some(e => e.userId === req.user._id && e.courseId === lesson.courseId);
        if (!hasAccess)
            return res.status(403).json({
                success: false,
                message: "Enroll in this course to access the lesson."
            });

        res.json({ success: true, data: lessonForResponse(lesson) });
    } catch (err) {
        console.error("Get Lesson Error:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching lesson."
        });
    }
};

const streamLessonVideo = (req, res) => {
    const lesson = db.lessons.find(l => l._id === req.params.id);
    if (!lesson || lesson.videoType !== "local" || !lesson.videoUrl)
        return res.status(404).json({ success: false, message: "Video not found." });

    const course = db.courses.find(c => c._id === lesson.courseId);
    let ticket;
    try {
        ticket = jwt.verify(String(req.query.ticket || ""), config.jwtSecret);
    } catch {
        return res.status(401).json({ success: false, message: "Video access link expired. Reload the course and try again." });
    }
    if (ticket.lessonId !== lesson._id)
        return res.status(403).json({ success: false, message: "Video access link is invalid." });

    const hasAccess = (ticket.userId && (
        course?.instructorId === ticket.userId ||
        db.users.find(u => u._id === ticket.userId)?.role === "admin" ||
        db.enrollments.some(e => e.userId === ticket.userId && e.courseId === lesson.courseId)
    ));
    if (!lesson.isFreePreview && !hasAccess)
        return res.status(403).json({ success: false, message: "Enroll in this course to watch this lesson." });

    const filename = path.basename(lesson.videoUrl);
    const videoPath = path.resolve(videoUploadDir, filename);
    const allowedDir = videoUploadDir + path.sep;
    if (!videoPath.startsWith(allowedDir) || !fs.existsSync(videoPath))
        return res.status(404).json({ success: false, message: "Video file not found." });
    res.set("Cache-Control", "private, no-store");
    res.set("Referrer-Policy", "no-referrer");
    return res.sendFile(videoPath);
};

const createLesson = async (req, res) => {
    try {
        const {
            courseId,
            moduleTitle,
            title,
            description,
            duration,
            videoUrl,
            videoType,
            resources,
            notes,
            isFreePreview,
            quizId
        } = req.body;

        if (!courseId || !title)
            return res.status(400).json({
                success: false,
                message: "Course ID and Lesson Title are required."
            });

        const course = db.courses.find(c => c._id === courseId);

        if (!course)
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });

        if (!canManageCourse(req, courseId))
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to manage lessons for this course."
            });

        const order =
            db.lessons.filter(l => l.courseId === courseId).length + 1;

        const finalVideoUrl = req.file
            ? `/uploads/videos/${req.file.filename}`
            : typeof videoUrl === "string" && videoUrl.trim()
                ? videoUrl.trim()
                : "";

        const finalVideoType = req.file
            ? "local"
            : videoType || "youtube";

        const newLesson = {
            _id: `les_${Date.now()}`,
            courseId,
            moduleTitle: moduleTitle || "Module 1",
            title: title.trim(),
            description: description || "",
            duration: duration || "15:00",
            durationSeconds: 900,
            videoUrl: finalVideoUrl,
            videoType: finalVideoType,
            resources: Array.isArray(resources) ? resources : [],
            notes: notes || "",
            order,
            isFreePreview:
                isFreePreview === true || isFreePreview === "true",
            quizId: quizId || undefined
        };

        db.lessons.push(newLesson);
        course.lessonsCount = (course.lessonsCount || 0) + 1;
        await db.save();

        res.status(201).json({
            success: true,
            message: "Lesson created successfully!",
            data: newLesson
        });
    } catch (err) {
        console.error("Create Lesson Error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Error creating lesson."
        });
    }
};

const updateLesson = async (req, res) => {
    try {
        const lesson = db.lessons.find(l => l._id === req.params.id);

        if (!lesson)
            return res.status(404).json({
                success: false,
                message: "Lesson not found."
            });

        if (!canManageCourse(req, lesson.courseId))
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this lesson."
            });

        const allowedFields = [
            "moduleTitle",
            "title",
            "description",
            "duration",
            "durationSeconds",
            "videoUrl",
            "videoType",
            "resources",
            "notes",
            "isFreePreview",
            "quizId"
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined)
                lesson[field] = req.body[field];
        });

        await db.save();

        res.json({
            success: true,
            message: "Lesson updated successfully.",
            data: lesson
        });
    } catch (err) {
        console.error("Update Lesson Error:", err);
        res.status(500).json({
            success: false,
            message: "Error updating lesson."
        });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const index = db.lessons.findIndex(
            l => l._id === req.params.id
        );

        if (index === -1)
            return res.status(404).json({
                success: false,
                message: "Lesson not found."
            });

        const lesson = db.lessons[index];

        if (!canManageCourse(req, lesson.courseId))
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this lesson."
            });

        const course = db.courses.find(
            c => c._id === lesson.courseId
        );

        if (course && course.lessonsCount > 0)
            course.lessonsCount--;

        db.lessons.splice(index, 1);
        await db.save();

        res.json({
            success: true,
            message: "Lesson deleted successfully."
        });
    } catch (err) {
        console.error("Delete Lesson Error:", err);
        res.status(500).json({
            success: false,
            message: "Error deleting lesson."
        });
    }
};

const reorderLessons = async (req, res) => {
    try {
        const { lessonOrders } = req.body;

        if (!Array.isArray(lessonOrders))
            return res.status(400).json({
                success: false,
                message: "lessonOrders array required."
            });

        for (const { id, order } of lessonOrders) {
            const lesson = db.lessons.find(l => l._id === id);
            if (!lesson) continue;

            if (!canManageCourse(req, lesson.courseId))
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to reorder one or more lessons."
                });

            lesson.order = Number(order);
        }

        await db.save();

        res.json({
            success: true,
            message: "Lessons reordered."
        });
    } catch (err) {
        console.error("Reorder Lessons Error:", err);
        res.status(500).json({
            success: false,
            message: "Error reordering lessons."
        });
    }
};

export {
    getLessonsByCourse,
    getLessonById,
    streamLessonVideo,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons
};
