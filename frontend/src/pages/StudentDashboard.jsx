import React, { useEffect, useState } from "react";
import {
    BookOpen,
    CheckCircle,
    Clock,
    Award,
    Flame,
    ArrowRight,
    Play,
    TrendingUp,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { ProgressBar } from "../components/ProgressBar.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80";

export const StudentDashboard = ({
    currentTab = "overview",
    setCurrentView,
}) => {
    const { user } = useAuth();

    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [wishlistCourses, setWishlistCourses] = useState([]);
    const [studyData, setStudyData] = useState([]);
    const [studyStreak, setStudyStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeSubTab, setActiveSubTab] = useState("all");

    useEffect(() => {
        let isMounted = true;

        const loadStudentData = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.getMyEnrollments();

                if (!isMounted) return;

                setEnrollments(
                    response?.success && Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                console.error("Enrollment API error:", err);

                if (isMounted) {
                    setEnrollments([]);
                    setError("Unable to load your enrolled courses.");
                }
            }

            try {
                const response = await api.getMyCertificates();

                if (!isMounted) return;

                setCertificates(
                    response?.success && Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                console.error("Certificate API error:", err);

                if (isMounted) setCertificates([]);
            }

            try {
                const response = await api.getWishlist();

                if (!isMounted) return;

                setWishlistCourses(
                    response?.success && Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                console.error("Wishlist API error:", err);

                if (isMounted) setWishlistCourses([]);
            }

            try {
                const response = await api.getMyLearningActivity();

                if (!isMounted) return;

                if (response?.success) {
                    setStudyData(
                        Array.isArray(response.data) ? response.data : []
                    );
                    setStudyStreak(Number(response.streakDays) || 0);
                } else {
                    setStudyData([]);
                    setStudyStreak(0);
                }
            } catch (err) {
                console.error("Learning activity API error:", err);

                if (isMounted) {
                    setStudyData([]);
                    setStudyStreak(0);
                }
            }

            if (isMounted) setLoading(false);
        };

        loadStudentData();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="mt-3 text-sm text-gray-500">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];
    const safeCertificates = Array.isArray(certificates)
        ? certificates
        : [];
    const safeStudyData = Array.isArray(studyData) ? studyData : [];

    const inProgressCourses = safeEnrollments.filter(
        course => !course?.completed
    );

    const completedCourses = safeEnrollments.filter(
        course => course?.completed
    );

    const continueCourse =
        inProgressCourses[0] || safeEnrollments[0] || null;

    const displayedEnrollments = safeEnrollments.filter(course => {
        if (activeSubTab === "in-progress") return !course?.completed;
        if (activeSubTab === "completed") return course?.completed;
        return true;
    });

    const totalLessons = safeStudyData.reduce(
        (sum, day) => sum + (Number(day?.lessons) || 0),
        0
    );

    const getCourseImage = course =>
        course?.courseThumbnail ||
        course?.thumbnail ||
        FALLBACK_IMAGE;

    const getCourseTitle = course =>
        course?.courseTitle ||
        course?.title ||
        "Untitled Course";

    const getCourseId = course =>
        course?.courseId ||
        course?.course?._id?.toString?.() ||
        course?.course?._id ||
        "";

    const getProgress = course => {
        const progress = Number(course?.progressPercentage);

        if (Number.isNaN(progress)) return 0;

        return Math.min(100, Math.max(0, progress));
    };

    const getDate = date => {
        if (!date) return "Recently";

        const parsedDate = new Date(date);

        return Number.isNaN(parsedDate.getTime())
            ? "Recently"
            : parsedDate.toLocaleDateString();
    };

    const openCourse = course => {
        const courseId = getCourseId(course);

        if (!courseId) {
            console.error("Course ID missing:", course);
            return;
        }

        setCurrentView("course-details", { courseId });
    };

    const continueLearning = course => {
        const courseId = getCourseId(course);

        if (!courseId) {
            console.error("Course ID missing:", course);
            return;
        }

        setCurrentView("learn", {
            courseId,
            initialLessonId: course?.lastLessonId || undefined,
        });
    };

    const tabs = [
        ["all", `All (${safeEnrollments.length})`],
        ["in-progress", `In Progress (${inProgressCourses.length})`],
        ["completed", `Completed (${completedCourses.length})`],
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold text-blue-600">
                                Student Dashboard
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-gray-900">
                                Welcome back, {user?.name || "Student"}!
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Continue your learning journey and track your
                                progress.
                            </p>
                        </div>

                        {continueCourse && (
                            <button
                                type="button"
                                onClick={() =>
                                    continueLearning(continueCourse)
                                }
                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <Play className="h-4 w-4 fill-current" />
                                Resume Learning
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {safeEnrollments.length}
                        </p>
                        <p className="text-xs text-gray-500">
                            Enrolled Courses
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {inProgressCourses.length}
                        </p>
                        <p className="text-xs text-gray-500">In Progress</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                            <Award className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {safeCertificates.length}
                        </p>
                        <p className="text-xs text-gray-500">Certificates</p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                            <Flame className="h-5 w-5 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {studyStreak}
                        </p>
                        <p className="text-xs text-gray-500">
                            Day Study Streak
                        </p>
                    </div>
                </div>

                {continueCourse && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-bold text-gray-900">
                                Continue Learning
                            </h2>

                            <span className="text-xs text-gray-400">
                                Last active:{" "}
                                {getDate(continueCourse?.updatedAt)}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex flex-1 items-center gap-3">
                                <img
                                    src={getCourseImage(continueCourse)}
                                    alt={getCourseTitle(continueCourse)}
                                    className="h-16 w-24 rounded-lg object-cover"
                                    onError={e => {
                                        e.currentTarget.src = FALLBACK_IMAGE;
                                    }}
                                />

                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-semibold text-gray-900">
                                        {getCourseTitle(continueCourse)}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {Array.isArray(
                                            continueCourse?.completedLessons
                                        )
                                            ? continueCourse.completedLessons
                                                .length
                                            : 0}{" "}
                                        lessons completed
                                    </p>
                                </div>
                            </div>

                            <div className="w-full md:w-56">
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="text-gray-500">
                                        Progress
                                    </span>

                                    <span className="font-semibold text-blue-600">
                                        {getProgress(continueCourse)}%
                                    </span>
                                </div>

                                <ProgressBar
                                    progress={getProgress(continueCourse)}
                                    size="sm"
                                    showText={false}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    continueLearning(continueCourse)
                                }
                                className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                                Continue
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                <h2 className="text-base font-bold text-gray-900">
                                    Learning Activity
                                </h2>
                            </div>

                            <span className="text-xs text-gray-400">
                                {totalLessons} lessons
                            </span>
                        </div>

                        <div className="h-56">
                            {safeStudyData.length === 0 ? (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-gray-400">
                                        No learning activity yet.
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={safeStudyData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />

                                        <XAxis
                                            dataKey="day"
                                            tick={{ fontSize: 11 }}
                                            stroke="#9ca3af"
                                        />

                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            stroke="#9ca3af"
                                        />

                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#ffffff",
                                                borderColor: "#e5e7eb",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                            }}
                                            formatter={value => [
                                                `${value} lessons`,
                                                "Completed",
                                            ]}
                                        />

                                        <Bar
                                            dataKey="lessons"
                                            fill="#2563eb"
                                            radius={[5, 5, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-green-600" />
                                <h2 className="text-base font-bold text-gray-900">
                                    Certificates
                                </h2>
                            </div>

                            <span className="text-xs text-gray-400">
                                {safeCertificates.length} earned
                            </span>
                        </div>

                        {safeCertificates.length === 0 ? (
                            <div className="py-10 text-center">
                                <Award className="mx-auto mb-2 h-9 w-9 text-gray-300" />

                                <p className="text-sm font-medium text-gray-600">
                                    No certificates yet.
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Complete your courses to earn certificates.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {safeCertificates.map(certificate => (
                                    <div
                                        key={
                                            certificate?._id ||
                                            certificate?.certificateId
                                        }
                                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-gray-900">
                                                {certificate?.courseTitle ||
                                                    "Course Certificate"}
                                            </p>

                                            <p className="mt-1 text-[10px] text-gray-400">
                                                ID:{" "}
                                                {certificate?.certificateId ||
                                                    "N/A"}
                                            </p>
                                        </div>

                                        {certificate?.certificateId && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentView(
                                                        "verify-certificate",
                                                        {
                                                            certificateId:
                                                                certificate.certificateId,
                                                        }
                                                    )
                                                }
                                                className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                            >
                                                View
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                My Courses
                            </h2>

                            <p className="text-xs text-gray-500">
                                Track your enrolled courses and progress.
                            </p>
                        </div>

                        <div className="flex w-fit rounded-lg bg-gray-100 p-1">
                            {tabs.map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveSubTab(id)}
                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activeSubTab === id
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {displayedEnrollments.length === 0 ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                            <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                            <p className="text-sm font-semibold text-gray-700">
                                {safeEnrollments.length === 0
                                    ? "You haven't enrolled in any course yet."
                                    : "No courses found."}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Browse courses and start learning.
                            </p>

                            <button
                                type="button"
                                onClick={() => setCurrentView("courses")}
                                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                                Browse Courses
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {displayedEnrollments.map(enrollment => {
                                const courseId = getCourseId(enrollment);
                                const progress = getProgress(enrollment);

                                return (
                                    <div
                                        key={
                                            enrollment?._id ||
                                            courseId
                                        }
                                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
                                            <img
                                                src={getCourseImage(
                                                    enrollment
                                                )}
                                                alt={getCourseTitle(
                                                    enrollment
                                                )}
                                                className="h-full w-full object-cover"
                                                onError={e => {
                                                    e.currentTarget.src =
                                                        FALLBACK_IMAGE;
                                                }}
                                            />

                                            {enrollment?.completed && (
                                                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-600 px-2 py-1 text-[10px] font-semibold text-white">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Completed
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <h3 className="truncate text-sm font-bold text-gray-900">
                                                {getCourseTitle(enrollment)}
                                            </h3>

                                            <div className="mt-3">
                                                <div className="mb-1 flex justify-between text-xs">
                                                    <span className="text-gray-500">
                                                        Progress
                                                    </span>

                                                    <span className="font-semibold text-blue-600">
                                                        {progress}%
                                                    </span>
                                                </div>

                                                <ProgressBar
                                                    progress={progress}
                                                    size="sm"
                                                    showText={false}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                                            <button
                                                type="button"
                                                disabled={!courseId}
                                                onClick={() =>
                                                    openCourse(enrollment)
                                                }
                                                className="text-xs font-semibold text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                View Course
                                            </button>

                                            <button
                                                type="button"
                                                disabled={!courseId}
                                                onClick={() =>
                                                    continueLearning(
                                                        enrollment
                                                    )
                                                }
                                                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {enrollment?.completed
                                                    ? "Review"
                                                    : "Continue"}

                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;