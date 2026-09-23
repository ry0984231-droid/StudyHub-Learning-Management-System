import { db } from "../db/store.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const error = (res, message, status = 500) =>
    res.status(status).json({ success: false, message });

const validPrices = (price, discountPrice) =>
    Number.isFinite(price) && Number.isFinite(discountPrice) &&
    price >= 0 && discountPrice >= 0 && discountPrice <= price;
const slugFor = title => title.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const getCourses = async (req, res) => {
    try {
        let courses = db.courses.filter(c => c.status === "published");

        const {
            category,
            level,
            minPrice,
            maxPrice,
            rating,
            search,
            sort,
            instructorId
        } = req.query;

        if (category && category !== "All")
            courses = courses.filter(
                c => c.category?.toLowerCase() === category.toLowerCase()
            );

        if (level && level !== "All")
            courses = courses.filter(
                c => c.level?.toLowerCase() === level.toLowerCase()
            );

        if (instructorId)
            courses = courses.filter(
                c => c.instructorId === instructorId
            );

        if (minPrice !== undefined && minPrice !== "")
            courses = courses.filter(
                c => Number(c.discountPrice ?? c.price ?? 0) >= Number(minPrice)
            );

        if (maxPrice !== undefined && maxPrice !== "")
            courses = courses.filter(
                c => Number(c.discountPrice ?? c.price ?? 0) <= Number(maxPrice)
            );

        if (rating !== undefined && rating !== "")
            courses = courses.filter(
                c => Number(c.rating || 0) >= Number(rating)
            );

        if (search) {
            const q = search.toLowerCase();

            courses = courses.filter(c =>
                [
                    c.title,
                    c.description,
                    c.category,
                    c.instructorName
                ].some(value =>
                    String(value || "").toLowerCase().includes(q)
                )
            );
        }

        const price = c => Number(c.discountPrice ?? c.price ?? 0);

        if (sort === "popular")
            courses.sort(
                (a, b) => (b.studentsCount || 0) - (a.studentsCount || 0)
            );
        else if (sort === "newest")
            courses.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
        else if (sort === "rating")
            courses.sort(
                (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
            );
        else if (sort === "price-asc")
            courses.sort((a, b) => price(a) - price(b));
        else if (sort === "price-desc")
            courses.sort((a, b) => price(b) - price(a));

        res.json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (err) {
        error(
            res,
            err?.message || "Error fetching courses."
        );
    }
};

const getCourseCategories = async (req, res) => {
    try {
        const categoryMap = {};

        db.courses.filter(c => c.status === "published").forEach(c => {
            const category = c.category || "Uncategorized";
            categoryMap[category] =
                (categoryMap[category] || 0) + 1;
        });

        const categories = Object.entries(categoryMap).map(
            ([name, count]) => ({ name, count })
        );

        res.json({
            success: true,
            data: categories
        });
    } catch (err) {
        error(res, "Error fetching categories.");
    }
};

const getHomeOverview = async (_req, res) => {
    try {
        const published = db.courses.filter(
            c => c.status === "published"
        );

        const courseIds = new Set(
            published.map(c => c._id)
        );

        const enrollments = db.enrollments.filter(e =>
            courseIds.has(e.courseId)
        );

        const reviews = db.reviews.filter(r =>
            courseIds.has(r.courseId)
        );

        const completed = enrollments.filter(
            e => e.isCompleted
        );

        const totalRating = reviews.reduce(
            (sum, r) => sum + Number(r.rating || 0),
            0
        );

        const latestReviews = [...reviews]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
            .slice(0, 3)
            .map(review => ({
                ...review,
                courseTitle:
                    db.courses.find(
                        c => c._id === review.courseId
                    )?.title || "Course"
            }));

        res.json({
            success: true,
            data: {
                learnerCount: new Set(
                    enrollments.map(e => e.userId)
                ).size,

                courseCount: courseIds.size,

                instructorCount: new Set(
                    published.map(c => c.instructorId)
                ).size,

                reviewCount: reviews.length,

                averageRating: reviews.length
                    ? totalRating / reviews.length
                    : null,

                completionRate: enrollments.length
                    ? Math.round(
                        (completed.length / enrollments.length) * 100
                    )
                    : null,

                reviews: latestReviews
            }
        });
    } catch (err) {
        error(
            res,
            err?.message || "Error fetching home overview."
        );
    }
};

const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const course = db.courses.find(
            c => c._id === id || c.slug === id
        );

        if (!course)
            return error(res, "Course not found.", 404);

        const canViewUnpublished = req.user && (
            req.user.role === "admin" ||
            course.instructorId === req.user._id
        );
        if (course.status !== "published" && !canViewUnpublished)
            return error(res, "Course not found.", 404);

        const lessons = db.lessons
            .filter(l => l.courseId === course._id)
            .sort((a, b) => a.order - b.order)
            .map(lesson => {
                const hasAccess = !!req.user && (
                    req.user.role === "admin" ||
                    course.instructorId === req.user._id ||
                    db.enrollments.some(e =>
                        e.userId === req.user._id && e.courseId === course._id
                    )
                );
                const mayWatch = lesson.isFreePreview || hasAccess;
                return {
                    ...lesson,
                    videoUrl: !mayWatch
                        ? ""
                        : lesson.videoType === "local"
                            ? `/api/lessons/${encodeURIComponent(lesson._id)}/video?ticket=${encodeURIComponent(jwt.sign(
                                { lessonId: lesson._id, userId: req.user?._id || null },
                                config.jwtSecret,
                                { expiresIn: "1h" }
                            ))}`
                            : lesson.videoUrl
                };
            });

        res.set("Cache-Control", "private, no-store");

        const reviews = db.reviews.filter(
            r => r.courseId === course._id
        );

        const quizzes = db.quizzes
            .filter(q => q.courseId === course._id)
            .map(({ questions, ...quiz }) => ({
                ...quiz,
                questions: questions.map(
                    ({
                        correctAnswers,
                        explanation,
                        ...question
                    }) => question
                )
            }));

        res.json({
            success: true,
            data: {
                ...course,
                lessons,
                reviews,
                quizzes
            }
        });
    } catch (err) {
        error(res, "Error retrieving course.");
    }
};

const createCourse = async (req, res) => {
    try {
        if (
            !req.user ||
            !["instructor", "admin"].includes(req.user.role)
        )
            return error(
                res,
                "Only instructors and admins can create courses.",
                403
            );

        const {
            title,
            description,
            thumbnail,
            videoPreview,
            category,
            level,
            price,
            discountPrice,
            duration,
            language,
            learningOutcomes,
            requirements,
            status
        } = req.body;

        if (typeof title !== "string" || !title.trim() ||
            typeof category !== "string" || !category.trim())
            return error(
                res,
                "Title and Category are required.",
                400
            );

        const coursePrice = price === undefined || price === "" ? 0 : Number(price);
        const courseDiscountPrice = discountPrice === undefined || discountPrice === ""
            ? coursePrice
            : Number(discountPrice);
        if (!validPrices(coursePrice, courseDiscountPrice))
            return error(res, "Price and discount must be valid non-negative amounts, and discount cannot exceed price.", 400);
        if (status !== undefined && !["draft", "published"].includes(status))
            return error(res, "Course status must be draft or published.", 400);

        const slug = slugFor(title);
        if (db.courses.some(course => course.slug === slug))
            return error(res, "A course with this title already exists. Choose a different title.", 409);

        const newCourse = {
            _id: `course_${Date.now()}`,
            title,
            slug,
            description: description || "",
            thumbnail:
                typeof thumbnail === "string"
                    ? thumbnail.trim()
                    : "",
            videoPreview: videoPreview || "",
            instructorId: req.user._id,
            instructorName: req.user.name,
            instructorTitle:
                req.user.bio?.slice(0, 50) ||
                "Course Instructor",
            instructorAvatar: req.user.avatar,
            instructorBio:
                req.user.bio ||
                "Academic instructor at StudyHub",
            category,
            level: level || "Beginner",
            price: coursePrice,
            discountPrice: courseDiscountPrice,
            duration: duration || "10 hours",
            language: language || "English",
            learningOutcomes: Array.isArray(learningOutcomes)
                ? learningOutcomes
                : [learningOutcomes].filter(Boolean),
            requirements: Array.isArray(requirements)
                ? requirements
                : [requirements].filter(Boolean),
            status: status || "published",
            rating: 5,
            ratingCount: 0,
            studentsCount: 0,
            lessonsCount: 0,
            createdAt: new Date().toISOString()
        };

        db.courses.push(newCourse);
        await db.save();

        res.status(201).json({
            success: true,
            message: "Course created successfully!",
            data: newCourse
        });
    } catch (err) {
        error(
            res,
            err?.message || "Failed to create course."
        );
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = db.courses.find(
            c => c._id === id
        );

        if (!course)
            return error(res, "Course not found", 404);

        if (
            req.user?.role !== "admin" &&
            course.instructorId !== req.user?._id
        )
            return error(
                res,
                "Not authorized to modify this course.",
                403
            );

        const fields = [
            "title",
            "description",
            "thumbnail",
            "videoPreview",
            "category",
            "level",
            "price",
            "discountPrice",
            "duration",
            "language",
            "learningOutcomes",
            "requirements",
            "status"
        ];

        const nextPrice = req.body.price === undefined
            ? Number(course.price || 0)
            : Number(req.body.price);
        const nextDiscountPrice = req.body.discountPrice === undefined
            ? (req.body.price === undefined
                ? Number(course.discountPrice ?? course.price ?? 0)
                : nextPrice)
            : Number(req.body.discountPrice);
        if (!validPrices(nextPrice, nextDiscountPrice))
            return error(res, "Price and discount must be valid non-negative amounts, and discount cannot exceed price.", 400);
        if (req.body.status !== undefined && !["draft", "published"].includes(req.body.status))
            return error(res, "Course status must be draft or published.", 400);

        if (req.body.title !== undefined) {
            if (typeof req.body.title !== "string" || !req.body.title.trim())
                return error(res, "Course title cannot be empty.", 400);
            const nextSlug = slugFor(String(req.body.title));
            if (db.courses.some(other => other._id !== course._id && other.slug === nextSlug))
                return error(res, "A course with this title already exists. Choose a different title.", 409);
        }

        fields.forEach(field => {
            if (field !== "price" && field !== "discountPrice" && req.body[field] !== undefined)
                course[field] = req.body[field];
        });
        course.price = nextPrice;
        course.discountPrice = nextDiscountPrice;

        if (course.title) course.slug = slugFor(course.title);

        await db.save();

        res.json({
            success: true,
            message: "Course updated successfully.",
            data: course
        });
    } catch (err) {
        error(res, "Error updating course.");
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const index = db.courses.findIndex(
            c => c._id === id
        );

        if (index === -1)
            return error(res, "Course not found", 404);

        const course = db.courses[index];

        if (
            req.user?.role !== "admin" &&
            course.instructorId !== req.user?._id
        )
            return error(
                res,
                "Not authorized to delete this course.",
                403
            );

        db.courses.splice(index, 1);
        await db.save();

        res.json({
            success: true,
            message: "Course deleted successfully."
        });
    } catch (err) {
        error(res, "Error deleting course.");
    }
};

const getInstructorCourses = async (req, res) => {
    try {
        if (
            !req.user ||
            !["instructor", "admin"].includes(req.user.role)
        )
            return error(
                res,
                "Instructor access required.",
                403
            );

        const data =
            req.user.role === "admin"
                ? [...db.courses]
                : db.courses.filter(
                    c => c.instructorId === req.user._id
                );

        data.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );

        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (err) {
        error(
            res,
            "Error fetching instructor courses."
        );
    }
};

export {
    getCourses,
    getCourseCategories,
    getHomeOverview,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getInstructorCourses
};
