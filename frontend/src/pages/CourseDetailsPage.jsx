import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Award,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock3,
    GraduationCap,
    Heart,
    Lock,
    Play,
    ShieldCheck,
    Star,
    Users,
    Video,
    X,
    Sparkles,
} from "lucide-react";

import { Rating } from "../components/Rating.jsx";
import { VideoPlayer } from "../components/VideoPlayer.jsx";
import { Modal } from "../components/Modal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";

const CourseDetailsPage = ({ courseId, setCurrentView }) => {
    const { user, isAuthenticated, updateUser } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewMessage, setReviewMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollmentMessage, setEnrollmentMessage] = useState("");

    const go = (view, params = {}) => setCurrentView(view, params);

    useEffect(() => {
        let active = true;

        const load = async () => {
            if (!courseId) return;

            try {
                setLoading(true);

                const response = await api.getCourse(courseId);
                const data = response?.course || response?.data || response;

                if (!active) return;

                setCourse(data);

                const firstModule =
                    data?.lessons?.[0]?.moduleTitle || "Course Lessons";

                if (data?.lessons?.length) {
                    setExpanded({ [firstModule]: true });
                }

                if (isAuthenticated) {
                    try {
                        const enrollment = await api.checkEnrollment(courseId);

                        if (active) {
                            setIsEnrolled(
                                Boolean(
                                    enrollment?.isEnrolled ??
                                    enrollment?.enrolled ??
                                    enrollment?.data?.isEnrolled
                                )
                            );
                        }
                    } catch {
                        if (active) setIsEnrolled(false);
                    }
                }
            } catch (error) {
                console.error("Course error:", error);
                if (active) setCourse(null);
            } finally {
                if (active) setLoading(false);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [courseId, isAuthenticated]);

    useEffect(() => {
        const wishlist = user?.wishlist || [];

        setIsWishlisted(
            wishlist.some(
                (item) =>
                    String(item?._id || item?.courseId || item) ===
                    String(courseId)
            )
        );
    }, [user, courseId]);

    const modules = useMemo(() => {
        const grouped = {};

        (course?.lessons || []).forEach((lesson) => {
            const title = lesson.moduleTitle || "Course Lessons";
            (grouped[title] ??= []).push(lesson);
        });

        return Object.entries(grouped).map(([title, lessons], index) => ({
            title,
            lessons,
            index: index + 1,
        }));
    }, [course]);

    const reviews = Array.isArray(course?.reviews) ? course.reviews : [];

    const originalPrice = Number(course?.price || 0);

    const finalPrice = Number(
        course?.discountPrice ??
        course?.salePrice ??
        course?.price ??
        0
    );

    const discount =
        originalPrice > finalPrice
            ? Math.round(
                ((originalPrice - finalPrice) / originalPrice) * 100
            )
            : 0;

    const lessonCount =
        course?.lessons?.length ?? course?.lessonsCount ?? 0;

    const rating = Number(course?.rating || 0);

    const students = Number(
        course?.studentsCount ?? course?.students ?? 0
    );

    const duration = course?.duration || "Self-paced";

    const instructor =
        course?.instructor?.name ||
        course?.instructorName ||
        "StudyHub Instructor";

    const email = course?.instructor?.email || "";

    const breakdown = useMemo(
        () =>
            [5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(
                    (r) => Math.round(Number(r.rating || 0)) === star
                ).length;

                return {
                    star,
                    count,
                    percentage: reviews.length
                        ? Math.round((count / reviews.length) * 100)
                        : 0,
                };
            }),
        [reviews]
    );

    const enroll = async () => {
        if (!isAuthenticated) return go("login");
        if (isEnrolled) return go("learn", { courseId: course._id });
        if (finalPrice > 0) return go("checkout", { courseId: course._id });

        setEnrolling(true);
        setEnrollmentMessage("");
        try {
            const response = await api.enrollCourse(course._id);
            if (!response?.success)
                throw new Error(response?.message || "Could not enroll in this course.");
            setIsEnrolled(true);
            go("learn", { courseId: course._id });
        } catch (error) {
            setEnrollmentMessage(error.message || "Could not enroll in this course.");
        } finally {
            setEnrolling(false);
        }
    };

    const toggleWishlist = async () => {
        if (!isAuthenticated) return go("login");

        try {
            const response = await api.toggleWishlist(course._id);

            setIsWishlisted(
                response?.wishlisted ??
                response?.isWishlisted ??
                !isWishlisted
            );

            if (updateUser && response?.user) {
                updateUser(response.user);
            }
        } catch (error) {
            console.error("Wishlist error:", error);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();

        if (!reviewText.trim()) {
            return setReviewMessage("Please write your review.");
        }

        if (!isAuthenticated) return go("login");

        try {
            setSubmitting(true);
            setReviewMessage("");

            const response = await api.addReview({
                courseId: course._id,
                rating: reviewRating,
                reviewText: reviewText.trim(),
            });

            const review =
                response?.review || response?.data || response;

            setCourse((prev) => ({
                ...prev,
                reviews: [review, ...(prev.reviews || [])],
            }));

            setReviewText("");
            setReviewRating(5);
            setReviewMessage("Review submitted successfully.");
        } catch (error) {
            setReviewMessage(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to submit review."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Skeleton />;

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 py-20 dark:bg-slate-950">
                <div className="mx-auto max-w-lg rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-white/10 dark:bg-white/[.04]">
                    <BookOpen
                        size={38}
                        className="mx-auto text-blue-600"
                    />

                    <h1 className="mt-5 text-2xl font-black">
                        Course not found
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        The course you are looking for is unavailable.
                    </p>

                    <button
                        onClick={() => go("courses")}
                        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                        <ArrowLeft
                            size={16}
                            className="mr-2 inline"
                        />
                        Browse Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

                {/* BACK */}
                <button
                    onClick={() => go("courses")}
                    className="group mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                    <ArrowLeft
                        size={17}
                        className="transition group-hover:-translate-x-1"
                    />
                    Back to Courses
                </button>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

                    {/* LEFT */}
                    <main className="min-w-0">

                        {/* HERO */}
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                            <div className="p-6 sm:p-8">

                                {/* BADGES */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                        {course.category || "Development"}
                                    </span>

                                    {course.level && (
                                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            {course.level}
                                        </span>
                                    )}

                                    {discount > 0 && (
                                        <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                            <Sparkles size={13} />
                                            {discount}% OFF
                                        </span>
                                    )}
                                </div>

                                {/* TITLE */}
                                <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                    {course.title}
                                </h1>

                                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                                    {course.description ||
                                        "Build practical skills through structured lessons, hands-on learning and a complete StudyHub experience."}
                                </p>

                                {/* RATING */}
                                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">

                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                                            {rating.toFixed(1)}
                                        </span>

                                        <Rating
                                            rating={rating}
                                            size="sm"
                                            showScore={false}
                                        />

                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            ({reviews.length} reviews)
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <Users
                                            size={16}
                                            className="text-blue-600 dark:text-blue-400"
                                        />
                                        {students} students
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <Video
                                            size={16}
                                            className="text-blue-600 dark:text-blue-400"
                                        />
                                        {lessonCount} lessons
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <Clock3 size={16} className="text-blue-600 dark:text-blue-400" />
                                        {duration}
                                    </div>
                                </div>

                                {/* INSTRUCTOR */}
                                <div className="mt-8 flex items-center gap-3">
                                    <Avatar name={instructor} />

                                    <div>
                                        <p className="text-[11px] text-slate-500">
                                            Created by
                                        </p>

                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {instructor}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </section>

                        {/* CONTENT */}
                        <div className="mt-7 space-y-7">

                            {/* LEARNING OUTCOMES */}
                            {Array.isArray(course.learningOutcomes) &&
                                course.learningOutcomes.length > 0 && (
                                    <Section
                                        eyebrow="LEARNING OUTCOMES"
                                        title="What you'll learn"
                                        text="Build practical knowledge and confidence through this course."
                                    >
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {course.learningOutcomes.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/[.06] dark:bg-white/[.025]"
                                                    >
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                            <CheckCircle2 size={18} />
                                                        </span>

                                                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                            {item}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </Section>
                                )}

                            {/* CURRICULUM */}
                            <Section
                                eyebrow="COURSE CONTENT"
                                title="Course curriculum"
                                text={`${modules.length} sections • ${lessonCount} lessons`}
                            >
                                <div className="space-y-3">

                                    {!modules.length ? (
                                        <Empty text="No lessons available yet." />
                                    ) : (
                                        modules.map((module) => {
                                            const open =
                                                !!expanded[module.title];

                                            return (
                                                <div
                                                    key={module.title}
                                                    className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[.07]"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setExpanded(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [module.title]:
                                                                        !prev[
                                                                        module
                                                                            .title
                                                                        ],
                                                                })
                                                            )
                                                        }
                                                        className="flex w-full items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left transition hover:bg-blue-50 dark:bg-white/[.025] dark:hover:bg-blue-500/[.05]"
                                                    >
                                                        <div className="flex min-w-0 items-center gap-4">
                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-black text-white">
                                                                {String(
                                                                    module.index
                                                                ).padStart(2, "0")}
                                                            </span>

                                                            <div className="min-w-0">
                                                                <h3 className="truncate text-sm font-bold">
                                                                    {module.title}
                                                                </h3>

                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {
                                                                        module
                                                                            .lessons
                                                                            .length
                                                                    }{" "}
                                                                    {module.lessons
                                                                        .length ===
                                                                        1
                                                                        ? "lesson"
                                                                        : "lessons"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {open ? (
                                                            <ChevronUp size={19} />
                                                        ) : (
                                                            <ChevronDown size={19} />
                                                        )}
                                                    </button>

                                                    {open && (
                                                        <div className="border-t border-slate-200 dark:border-white/[.07]">
                                                            {module.lessons.map(
                                                                (
                                                                    lesson,
                                                                    index
                                                                ) => {
                                                                    const preview =
                                                                        lesson.isFreePreview ||
                                                                        lesson.freePreview;

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                lesson._id ||
                                                                                index
                                                                            }
                                                                            className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-white/[.05]"
                                                                        >
                                                                            <span
                                                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${preview
                                                                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                                                    : "bg-slate-100 text-slate-500 dark:bg-white/[.06]"
                                                                                    }`}
                                                                            >
                                                                                {preview ? (
                                                                                    <Play
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                        fill="currentColor"
                                                                                    />
                                                                                ) : (
                                                                                    <Lock
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                    />
                                                                                )}
                                                                            </span>

                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="truncate text-sm font-semibold">
                                                                                    {lesson.title ||
                                                                                        `Lesson ${index +
                                                                                        1
                                                                                        }`}
                                                                                </p>

                                                                                <div className="mt-1 flex items-center gap-2">
                                                                                    {preview && (
                                                                                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                                                                            Free
                                                                                            Preview
                                                                                        </span>
                                                                                    )}

                                                                                    {lesson.duration && (
                                                                                        <span className="text-xs text-slate-400">
                                                                                            {
                                                                                                lesson.duration
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {preview && (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        setPreviewOpen(
                                                                                            true
                                                                                        )
                                                                                    }
                                                                                    className="hidden rounded-lg px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 sm:block"
                                                                                >
                                                                                    Preview
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </Section>

                            {/* INSTRUCTOR */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                                <div className="bg-slate-50 p-6 dark:bg-slate-800/60 sm:p-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                                        <Avatar
                                            name={instructor}
                                            big
                                        />

                                        <div>
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                                Course Instructor
                                            </span>

                                            <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                                                {instructor}
                                            </h2>

                                            {email && (
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {email}
                                                </p>
                                            )}

                                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                Learn through structured content
                                                designed to help you understand
                                                concepts and apply them practically.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                    <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800">
                                    <InstructorStat
                                        v={students}
                                        t="Students"
                                    />

                                    <InstructorStat
                                        v={lessonCount}
                                        t="Lessons"
                                    />

                                    <InstructorStat
                                        v={rating.toFixed(1)}
                                        t="Rating"
                                    />
                                </div>
                            </section>

                            {/* REVIEWS */}
                            <Section
                                eyebrow="STUDENT FEEDBACK"
                                title="Course reviews"
                                text="See what learners are saying about this course."
                            >
                                <div className="grid gap-6 rounded-2xl bg-slate-50 p-5 dark:bg-white/[.025] sm:grid-cols-[180px_1fr]">

                                    <div className="flex flex-col items-center justify-center border-b pb-5 sm:border-b-0 sm:border-r sm:pb-0 dark:border-white/[.07]">
                                        <b className="text-5xl">
                                            {rating.toFixed(1)}
                                        </b>

                                        <Rating
                                            rating={rating}
                                            size="md"
                                            showScore={false}
                                        />

                                        <p className="mt-2 text-xs text-slate-500">
                                            {reviews.length} total reviews
                                        </p>
                                    </div>

                                    <div className="space-y-2.5">
                                        {breakdown.map((item) => (
                                            <div
                                                key={item.star}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="w-8 text-xs">
                                                    {item.star}★
                                                </span>

                                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700"
                                                        style={{
                                                            width: `${item.percentage}%`,
                                                        }}
                                                    />
                                                </div>

                                                <span className="w-9 text-right text-xs text-slate-400">
                                                    {item.percentage}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* REVIEW FORM */}
                                {isEnrolled && (
                                    <form
                                        onSubmit={submitReview}
                                        className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-500/10 dark:bg-blue-500/[.04]"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold">
                                                    Share your experience
                                                </h3>

                                                <p className="text-xs text-slate-500">
                                                    Your feedback helps other learners.
                                                </p>
                                            </div>

                                            <Rating
                                                rating={reviewRating}
                                                interactive
                                                onRatingChange={
                                                    setReviewRating
                                                }
                                                size="md"
                                                showScore={false}
                                            />
                                        </div>

                                        <textarea
                                            value={reviewText}
                                            onChange={(e) =>
                                                setReviewText(e.target.value)
                                            }
                                            placeholder="Write your review..."
                                            rows={4}
                                            className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[.04]"
                                        />

                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <p
                                                className={`text-sm ${reviewMessage
                                                    .toLowerCase()
                                                    .includes("success")
                                                    ? "text-blue-600"
                                                    : "text-red-500"
                                                    }`}
                                            >
                                                {reviewMessage}
                                            </p>

                                            <button
                                                disabled={submitting}
                                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                                            >
                                                {submitting
                                                    ? "Submitting..."
                                                    : "Submit Review"}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* REVIEW LIST */}
                                <div className="mt-8 space-y-4">
                                    {!reviews.length ? (
                                        <Empty text="No reviews yet. Be the first student to review this course." />
                                    ) : (
                                        reviews.map((review, index) => {
                                            const name =
                                                review.userName ||
                                                review.user?.name ||
                                                "Student";

                                            return (
                                                <div
                                                    key={
                                                        review._id || index
                                                    }
                                                    className="rounded-2xl border border-slate-200 p-5 dark:border-white/[.07]"
                                                >
                                                    <div className="flex gap-4">

                                                        {review.userAvatar ? (
                                                            <img
                                                                src={
                                                                    review.userAvatar
                                                                }
                                                                alt={name}
                                                                className="h-11 w-11 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <Avatar name={name} />
                                                        )}

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex flex-wrap justify-between gap-2">
                                                                <div>
                                                                    <h4 className="font-bold">
                                                                        {name}
                                                                    </h4>

                                                                    <Rating
                                                                        rating={Number(
                                                                            review.rating ||
                                                                            0
                                                                        )}
                                                                        size="sm"
                                                                        showScore={
                                                                            false
                                                                        }
                                                                    />
                                                                </div>

                                                                <span className="text-xs text-slate-400">
                                                                    {review.createdAt
                                                                        ? new Date(
                                                                            review.createdAt
                                                                        ).toLocaleDateString()
                                                                        : ""}
                                                                </span>
                                                            </div>

                                                            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                                                {review.reviewText ||
                                                                    review.text ||
                                                                    "Great course!"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </Section>
                        </div>
                    </main>

                    {/* RIGHT PURCHASE CARD */}
                    <aside className="xl:sticky xl:top-24">

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                            {/* THUMBNAIL */}
                            <div className="relative aspect-video overflow-hidden bg-slate-900">

                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="h-full w-full object-cover transition duration-700 hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-blue-600">
                                        <GraduationCap
                                            size={70}
                                            className="text-white/80"
                                        />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                                {discount > 0 && (
                                    <span className="absolute left-4 top-4 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                                        {discount}% OFF
                                    </span>
                                )}

                                <button
                                    onClick={() =>
                                        setPreviewOpen(true)
                                    }
                                    className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:bg-white/25"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600">
                                        <Play
                                            size={15}
                                            fill="currentColor"
                                        />
                                    </span>

                                    Watch Course Preview
                                </button>
                            </div>

                            <div className="p-6">

                                {/* PRICE */}
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-black tracking-tight">
                                        ₹{finalPrice.toLocaleString("en-IN")}
                                    </span>

                                    {originalPrice > finalPrice && (
                                        <span className="pb-1 text-lg text-slate-400 line-through">
                                            ₹
                                            {originalPrice.toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>
                                    )}
                                </div>

                                {discount > 0 && (
                                    <p className="mt-1 text-xs font-semibold text-blue-600">
                                        Save ₹
                                        {(
                                            originalPrice - finalPrice
                                        ).toLocaleString("en-IN")}{" "}
                                        on this course
                                    </p>
                                )}

                                {/* CTA */}
                                <button
                                    onClick={enroll}
                                    disabled={enrolling}
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {enrolling
                                        ? "Enrolling..."
                                        : isEnrolled
                                        ? "Continue Learning"
                                        : "Enroll Now"}

                                    <ArrowRight size={17} />
                                </button>
                                {enrollmentMessage && (
                                    <p role="alert" className="mt-2 text-sm text-red-600">
                                        {enrollmentMessage}
                                    </p>
                                )}

                                {/* WISHLIST */}
                                <button
                                    onClick={toggleWishlist}
                                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-bold transition ${isWishlisted
                                        ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[.04]"
                                        }`}
                                >
                                    <Heart
                                        size={17}
                                        fill={
                                            isWishlisted
                                                ? "currentColor"
                                                : "none"
                                        }
                                    />

                                    {isWishlisted
                                        ? "Added to Wishlist"
                                        : "Add to Wishlist"}
                                </button>

                                {/* INCLUDES */}
                                <div className="mt-7 border-t border-slate-200 pt-6 dark:border-white/[.08]">

                                    <h3 className="text-sm font-black">
                                        This course includes
                                    </h3>

                                    <div className="mt-4 space-y-4">
                                        <Include
                                            icon={<Video />}
                                            text={`${lessonCount} video lessons`}
                                        />

                                        <Include
                                            icon={<Clock3 />}
                                            text={`${duration} learning content`}
                                        />

                                        <Include
                                            icon={<BookOpen />}
                                            text="Structured curriculum"
                                        />

                                        <Include
                                            icon={<Award />}
                                            text="Completion tracking"
                                        />

                                        <Include
                                            icon={<ShieldCheck />}
                                            text="StudyHub dashboard access"
                                        />
                                    </div>
                                </div>

                                {/* TRUST */}
                                <div className="mt-6 rounded-2xl bg-blue-50 p-4 dark:bg-blue-500/[.06]">
                                    <div className="flex gap-3">
                                        <ShieldCheck
                                            size={20}
                                            className="shrink-0 text-blue-600 dark:text-blue-400"
                                        />

                                        <div>
                                            <p className="text-xs font-bold">
                                                Learn at your own pace
                                            </p>

                                            <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                                Access your enrolled learning
                                                content from your StudyHub
                                                dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {previewOpen && (
                <Modal
                    isOpen={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    title="Course Preview"
                    maxWidth="4xl"
                >
                    <div className="overflow-hidden rounded-2xl bg-black">
                        {course.videoPreview ? (
                            <VideoPlayer
                                src={course.videoPreview}
                                title={course.title}
                            />
                        ) : (
                            <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center text-white">
                                <Video size={38} />

                                <h3 className="mt-4 text-lg font-bold">
                                    Preview unavailable
                                </h3>

                                <p className="mt-2 text-sm text-slate-400">
                                    A preview video has not been added to this
                                    course yet.
                                </p>

                                <button
                                    onClick={() =>
                                        setPreviewOpen(false)
                                    }
                                    className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900"
                                >
                                    <X
                                        size={15}
                                        className="mr-1 inline"
                                    />
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

/* ================= COMPONENTS ================= */

const Avatar = ({ name = "StudyHub", big = false }) => (
    <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 ${big
            ? "h-20 w-20 rounded-2xl text-2xl"
            : "h-11 w-11 text-xs"
            }`}
    >
        {name
            .split(" ")
            .map((x) => x[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
    </div>
);

const Section = ({ eyebrow, title, text, children }) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600 dark:text-blue-400">
            {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {text}
        </p>

        <div className="mt-7">{children}</div>
    </section>
);

const Include = ({ icon, text }) => (
    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="text-blue-600 dark:text-blue-400">
            {React.cloneElement(icon, { size: 17 })}
        </span>

        {text}
    </div>
);

const InstructorStat = ({ v, t }) => (
    <div className="px-3 py-4 text-center">
        <p className="text-lg font-black">{v}</p>
        <p className="text-[11px] text-slate-500">{t}</p>
    </div>
);

const Empty = ({ text }) => (
    <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500 dark:border-white/10">
        {text}
    </div>
);

const Skeleton = () => (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl animate-pulse">

            <div className="mb-6 h-5 w-28 rounded bg-slate-200 dark:bg-white/10" />

            <div className="h-[320px] rounded-2xl bg-slate-200 dark:bg-slate-800" />

            <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="h-[560px] rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
        </div>
    </div>
);

export { CourseDetailsPage };
export default CourseDetailsPage;
