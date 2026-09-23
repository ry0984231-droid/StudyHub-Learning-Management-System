import React from "react";
import {
    ArrowRight,
    BookOpen,
    ChartNoAxesCombined,
    CheckCircle2,
    GraduationCap,
    NotebookPen,
    Users,
} from "lucide-react";

const features = [
    {
        icon: BookOpen,
        title: "Courses and Lessons",
        description:
            "Students can browse available courses and access lessons in an organized learning structure.",
    },
    {
        icon: NotebookPen,
        title: "Quizzes and Certificates",
        description:
            "Students can attempt quizzes to check their understanding and receive certificates after completing courses.",
    },
    {
        icon: ChartNoAxesCombined,
        title: "Progress Tracking",
        description:
            "The dashboard helps students monitor completed lessons and their overall course learning progress.",
    },
];

const highlights = [
    "Course enrollment and learning",
    "Lesson and video-based content",
    "Quiz and assessment support",
    "Student progress tracking",
    "Course completion certificates",
    "Instructor course management",
];

export const AboutPage = ({ setCurrentView }) => {
    return (
        <div className="min-h-screen bg-white text-gray-900">

            {/* ================= HERO ================= */}
            <section className="border-b border-blue-800 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
                <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">

                    <div className="mx-auto max-w-3xl">

                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100">
                            <GraduationCap className="h-5 w-5" />
                            About StudyHub
                        </div>

                        <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
                            Learning Management System
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                            StudyHub is a web-based Learning Management System
                            designed to provide students and instructors with
                            a simple platform for managing online learning,
                            courses, lessons, quizzes, and progress.
                        </p>

                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setCurrentView("courses")}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Explore Courses
                                <ArrowRight className="h-4 w-4" />
                            </button>

                            <span className="inline-flex items-center rounded-lg border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-medium text-white">
                                Student & Instructor Platform
                            </span>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= ABOUT PROJECT ================= */}
            <section className="bg-white py-12 sm:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

                        <div>
                            <p className="text-sm font-semibold text-blue-600">
                                About the Project
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                                Built to simplify online learning
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-gray-600">
                                StudyHub provides a centralized platform where
                                students can discover courses, enroll in
                                learning content, complete lessons, attempt
                                quizzes, and monitor their progress.
                            </p>

                            <p className="mt-4 text-sm leading-7 text-gray-600">
                                Instructors can create courses and organize
                                educational content, making it easier to
                                manage learning material from a single
                                platform.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                Key Features
                            </h3>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {highlights.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-start gap-3 rounded-lg bg-white p-3"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                                        <span className="text-sm text-gray-600">
                                            {item}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section className="border-y border-gray-200 bg-gray-50 py-12 sm:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-blue-600">
                            Platform Features
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Features available in StudyHub
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            The platform includes the basic functionality
                            required for managing and participating in
                            online courses.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-5 md:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <article
                                    key={feature.title}
                                    className="rounded-xl border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <h3 className="mt-4 text-base font-bold text-gray-900">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        {feature.description}
                                    </p>
                                </article>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* ================= ROLES ================= */}
            <section className="bg-white py-12 sm:py-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold text-purple-600">
                            User Roles
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Designed for students and instructors
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Different user roles provide access to the
                            features required for learning and course
                            management.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-5 md:grid-cols-2">

                        {/* Student */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Users className="h-5 w-5" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-900">
                                    Student
                                </h3>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-gray-500">
                                Students can browse courses, enroll in
                                available courses, access lessons, complete
                                quizzes, track progress, and view their
                                certificates.
                            </p>
                        </div>

                        {/* Instructor */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                    <GraduationCap className="h-5 w-5" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-900">
                                    Instructor
                                </h3>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-gray-500">
                                Instructors can create courses, add lessons,
                                organize course content, and manage the
                                learning material available to students.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="border-t border-gray-200 bg-blue-600 py-10 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">

                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                        Explore the StudyHub course library
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blue-100">
                        Browse available courses and start learning through
                        the StudyHub platform.
                    </p>

                    <button
                        type="button"
                        onClick={() => setCurrentView("courses")}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-gray-100"
                    >
                        Browse Courses
                        <ArrowRight className="h-4 w-4" />
                    </button>

                </div>
            </section>

        </div>
    );
};

export default AboutPage;
