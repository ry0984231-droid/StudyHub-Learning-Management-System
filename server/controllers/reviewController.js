import { db } from "../db/store.js";

const getCourseReviews = async (req, res) => {
    try {
        const reviews = db.reviews
            .filter(r => r.courseId === req.params.courseId)
            .sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const total = reviews.reduce((sum, review) => {
            const rating = Math.round(review.rating);
            if (distribution[rating] !== undefined)
                distribution[rating]++;
            return sum + review.rating;
        }, 0);

        res.json({
            success: true,
            count: reviews.length,
            averageRating: reviews.length
                ? Number((total / reviews.length).toFixed(1))
                : 0,
            distribution,
            data: reviews
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error fetching reviews."
        });
    }
};

const addReview = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });

        const { courseId, rating, reviewText } = req.body;

        if (!courseId || !rating || !reviewText)
            return res.status(400).json({
                success: false,
                message:
                    "Course ID, rating, and review text required."
            });

        const enrollment = db.enrollments.find(
            e =>
                e.userId === req.user._id &&
                e.courseId === courseId
        );

        if (!enrollment && req.user.role === "student")
            return res.status(403).json({
                success: false,
                message:
                    "Only enrolled students can submit a review."
            });

        const course = db.courses.find(
            c => c._id === courseId
        );

        if (!course)
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });

        const newReview = {
            _id: `rev_${Date.now()}`,
            courseId,
            userId: req.user._id,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            rating: Number(rating),
            reviewText,
            createdAt: new Date().toISOString()
        };

        db.reviews.push(newReview);

        const reviews = db.reviews.filter(
            r => r.courseId === courseId
        );

        const total = reviews.reduce(
            (sum, r) => sum + r.rating,
            0
        );

        course.rating = Number(
            (total / reviews.length).toFixed(2)
        );
        course.ratingCount = reviews.length;

        await db.save();

        res.status(201).json({
            success: true,
            message: "Review posted successfully!",
            data: newReview
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error submitting review."
        });
    }
};

export {
    getCourseReviews,
    addReview
};
