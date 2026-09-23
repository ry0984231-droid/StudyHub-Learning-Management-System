import React, { useEffect, useState } from "react";
import {
    ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Circle,
    Download, BookOpen, FileQuestion, Award, Menu, X
} from "lucide-react";

import { VideoPlayer } from "../components/VideoPlayer.jsx";
import { ProgressBar } from "../components/ProgressBar.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export const VideoLearningPage = ({
    courseId,
    initialLessonId,
    setCurrentView
}) => {
    const { user } = useAuth();

    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [completed, setCompleted] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebar, setSidebar] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const courseRes = await api.getCourse(courseId);

                if (courseRes.success) {
                    const data = courseRes.data;
                    setCourse(data);

                    const lessons = data.lessons || [];
                    setLesson(
                        lessons.find((x) => x._id === initialLessonId) ||
                        lessons[0]
                    );
                }

                const enrollment = await api.checkEnrollment(courseId);
                setIsEnrolled(Boolean(enrollment.success && enrollment.isEnrolled));

                if (enrollment.success && enrollment.enrollment) {
                    setCompleted(
                        enrollment.enrollment.completedLessons || []
                    );
                    setProgress(
                        enrollment.enrollment.progressPercentage || 0
                    );
                }
            } catch (err) {
                console.error("Classroom error:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [courseId, initialLessonId]);

    if (loading || !course || !lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 mx-auto rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                    <p className="mt-2 text-xs text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    const canAccessCourse = isEnrolled || user?.role === "admin" ||
        course.instructorId === user?._id;
    if (!canAccessCourse) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
                    <BookOpen className="mx-auto h-10 w-10 text-blue-600" />
                    <h1 className="mt-4 text-xl font-bold">Enroll to start learning</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Enroll in this course before opening the classroom.
                    </p>
                    <button
                        onClick={() => setCurrentView("course-details", { courseId })}
                        className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        View Course
                    </button>
                </div>
            </div>
        );
    }

    const lessons = course.lessons || [];
    const index = lessons.findIndex((x) => x._id === lesson._id);
    const previous = index > 0 ? lessons[index - 1] : null;
    const next = index < lessons.length - 1 ? lessons[index + 1] : null;
    const isCompleted = completed.includes(lesson._id);

    const completeLesson = async () => {
        try {
            const res = await api.completeLesson(courseId, lesson._id);

            if (!res.success) return;

            if (!completed.includes(lesson._id)) {
                setCompleted((prev) => [...prev, lesson._id]);
            }

            setProgress(res.progressPercentage);

            if (res.certificate) setCertificate(res.certificate);
            else if (next) setLesson(next);
        } catch (err) {
            console.error("Complete lesson error:", err);
        }
    };

    const modules = lessons.reduce((acc, item) => {
        const name = item.moduleTitle || "Course Content";
        (acc[name] ||= []).push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">

            {/* Header */}
            <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b dark:border-slate-700">
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={() => setCurrentView("student-dashboard")}
                        className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <h1 className="text-sm font-bold truncate">
                        {course.title}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 w-32">
                        <ProgressBar
                            progress={progress}
                            size="sm"
                            showText={false}
                        />
                        <span className="text-xs font-bold text-blue-600">
                            {progress}%
                        </span>
                    </div>

                    <button
                        onClick={() => setSidebar(!sidebar)}
                        className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        {sidebar ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row">

                {/* Main */}
                <main className="flex-1 p-4">
                    <div className="max-w-4xl mx-auto space-y-4">

                        {/* Video */}
                        <div className="rounded-xl overflow-hidden bg-black">
                            <VideoPlayer
                                videoUrl={lesson.videoUrl}
                                videoType={lesson.videoType}
                                title={lesson.title}
                                onEnded={completeLesson}
                            />
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-700">
                            <div className="flex gap-2">
                                <button
                                    disabled={!previous}
                                    onClick={() => previous && setLesson(previous)}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold disabled:opacity-40"
                                >
                                    <ChevronLeft size={15} />
                                    Previous
                                </button>

                                <button
                                    disabled={!next}
                                    onClick={() => next && setLesson(next)}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold disabled:opacity-40"
                                >
                                    Next
                                    <ChevronRight size={15} />
                                </button>
                            </div>

                            <button
                                onClick={completeLesson}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${isCompleted
                                        ? "bg-green-50 text-green-700"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                <CheckCircle2 size={15} />
                                {isCompleted ? "Completed" : "Complete"}
                            </button>
                        </div>

                        {/* Lesson Info */}
                        <section className="p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-700">
                            <p className="text-xs font-semibold text-blue-600">
                                {lesson.moduleTitle || "Course Content"} • Lesson {lesson.order}
                            </p>

                            <h2 className="mt-1 text-lg font-bold">
                                {lesson.title}
                            </h2>

                            {lesson.description && (
                                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-400">
                                    {lesson.description}
                                </p>
                            )}

                            {lesson.notes && (
                                <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                                    <p className="mb-1 text-xs font-bold">
                                        Lecture Notes
                                    </p>
                                    <p className="whitespace-pre-wrap text-xs leading-5 text-gray-600 dark:text-slate-400">
                                        {lesson.notes}
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Resources */}
                        {lesson.resources?.length > 0 && (
                            <section className="p-4 bg-white dark:bg-slate-900 border rounded-xl dark:border-slate-700">
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                                    <Download size={16} className="text-blue-600" />
                                    Resources
                                </h3>

                                <div className="space-y-2">
                                    {lesson.resources.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold truncate">
                                                    {item.title}
                                                </p>
                                                <p className="text-[10px] text-gray-500">
                                                    {item.type} • {item.size || "1.2 MB"}
                                                </p>
                                            </div>

                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Lesson Quiz */}
                        {lesson.quizId && (
                            <section className="flex items-center justify-between p-4 rounded-xl border border-blue-100 bg-blue-50">
                                <div className="flex items-center gap-3">
                                    <FileQuestion size={18} className="text-blue-600" />
                                    <div>
                                        <p className="text-xs font-bold text-blue-900">
                                            Lesson Quiz
                                        </p>
                                        <p className="text-[11px] text-blue-700">
                                            Test your understanding.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        setCurrentView("quiz", {
                                            quizId: lesson.quizId
                                        })
                                    }
                                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold"
                                >
                                    Take Quiz
                                </button>
                            </section>
                        )}
                    </div>
                </main>

                {/* Curriculum */}
                {sidebar && (
                    <aside className="w-full lg:w-72 lg:h-[calc(100vh-56px)] lg:overflow-y-auto bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l dark:border-slate-700">

                        <div className="p-4 border-b dark:border-slate-700">
                            <div className="flex items-center gap-2">
                                <BookOpen size={16} className="text-blue-600" />
                                <h3 className="text-sm font-bold">
                                    Course Curriculum
                                </h3>
                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                {completed.length} / {lessons.length} completed
                            </p>

                            <div className="mt-3">
                                <ProgressBar
                                    progress={progress}
                                    size="sm"
                                    showText={false}
                                />
                            </div>
                        </div>

                        <div className="p-3">
                            {Object.entries(modules).map(([name, items]) => (
                                <div key={name} className="mb-4">
                                    <p className="mb-2 px-2 text-[10px] font-bold uppercase text-gray-400">
                                        {name}
                                    </p>

                                    <div className="space-y-1">
                                        {items.map((item) => {
                                            const active = item._id === lesson._id;
                                            const done = completed.includes(item._id);

                                            return (
                                                <button
                                                    key={item._id}
                                                    onClick={() => setLesson(item)}
                                                    className={`flex w-full items-center gap-2 p-2.5 rounded-lg text-left text-xs ${active
                                                            ? "bg-blue-600 text-white"
                                                            : "text-gray-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800"
                                                        }`}
                                                >
                                                    {done ? (
                                                        <CheckCircle2
                                                            size={15}
                                                            className={
                                                                active
                                                                    ? "text-white"
                                                                    : "text-green-500"
                                                            }
                                                        />
                                                    ) : (
                                                        <Circle
                                                            size={15}
                                                            className={
                                                                active
                                                                    ? "text-blue-100"
                                                                    : "text-gray-300"
                                                            }
                                                        />
                                                    )}

                                                    <span className="flex-1 truncate">
                                                        {item.title}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Course Quizzes */}
                            {course.quizzes?.length > 0 && (
                                <div className="border-t pt-3">
                                    <p className="mb-2 text-[10px] font-bold uppercase text-gray-400">
                                        Course Quizzes
                                    </p>

                                    {course.quizzes.map((quiz) => (
                                        <button
                                            key={quiz._id}
                                            onClick={() =>
                                                setCurrentView("quiz", {
                                                    quizId: quiz._id
                                                })
                                            }
                                            className="w-full mb-2 p-3 flex items-center justify-between rounded-lg border text-left hover:border-blue-300"
                                        >
                                            <span className="flex items-center gap-2 min-w-0">
                                                <FileQuestion
                                                    size={15}
                                                    className="text-blue-600"
                                                />
                                                <span className="truncate text-xs font-semibold">
                                                    {quiz.title}
                                                </span>
                                            </span>

                                            <span className="text-[10px] font-bold text-blue-600">
                                                Start
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* Certificate */}
            {certificate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 rounded-xl text-center shadow-xl">

                        <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-blue-50">
                            <Award size={28} className="text-blue-600" />
                        </div>

                        <h2 className="mt-4 text-xl font-bold">
                            Congratulations!
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {user?.name}, you completed the course.
                        </p>

                        <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-left">
                            <p className="text-[10px] font-bold text-gray-400">
                                Certificate ID
                            </p>

                            <p className="mt-1 font-mono text-xs font-bold text-blue-600">
                                {certificate.certificateId}
                            </p>

                            <p className="mt-2 text-[10px] text-gray-500">
                                Verification Code: {certificate.verificationCode}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setCertificate(null);
                                setCurrentView("student-certificates");
                            }}
                            className="mt-5 w-full py-2.5 rounded-lg bg-blue-600 text-xs font-bold text-white"
                        >
                            View Certificate
                        </button>

                        <button
                            onClick={() => setCertificate(null)}
                            className="mt-2 w-full py-2.5 rounded-lg border text-xs font-semibold text-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoLearningPage;
