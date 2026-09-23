import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowRight, Award, BookOpen, ChevronRight, GraduationCap,
    ShieldCheck, Sparkles, Star, Users
} from "lucide-react";
import { api } from "../services/api.js";
import CourseCard from "../components/CourseCard.jsx";

export const HomePage = ({ setCurrentView }) => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const [c, cat] = await Promise.all([
                    api.getCourses(),
                    api.getCategories()
                ]);
                setCourses(c?.success && Array.isArray(c.data) ? c.data : []);
                setCategories(cat?.success && Array.isArray(cat.data) ? cat.data : []);
            } catch (err) {
                console.error("Failed to load homepage data:", err);
                setCourses([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const featured = useMemo(() => {
        const data = [...courses];
        if (activeTab === "popular")
            data.sort((a, b) => (b.studentsCount ?? 0) - (a.studentsCount ?? 0));
        if (activeTab === "topRated")
            data.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        return data.slice(0, 8);
    }, [courses, activeTab]);

    const stats = useMemo(() => ({
        students: courses.reduce((s, c) => s + (c.studentsCount ?? 0), 0),
        lessons: courses.reduce((s, c) => s + (c.lessonsCount ?? 0), 0),
        rating: (() => {
            const rated = courses.filter(c => Number(c.rating) > 0);
            return rated.length
                ? (rated.reduce((s, c) => s + Number(c.rating || 0), 0) / rated.length).toFixed(1)
                : "0.0";
        })()
    }), [courses]);

    const go = (view, params) => setCurrentView(view, params);

    const features = [
        [GraduationCap, "Learn Practical Skills", "Learn concepts through structured courses and practical lessons that help you understand real-world topics."],
        [ShieldCheck, "Structured Learning", "Follow organized lessons and track your learning journey from one convenient dashboard."],
        [Award, "Track Your Progress", "Monitor completed lessons, courses, achievements, and certificates as you continue learning."]
    ];

    const steps = [
        ["01", "Explore Courses", "Browse available courses and find the subject you want to learn."],
        ["02", "Learn & Practice", "Complete lessons at your own pace and build your understanding step by step."],
        ["03", "Complete & Achieve", "Track your progress and earn certificates after completing your learning journey."]
    ];

    return (
        <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">

            {/* Hero */}
            <section className="bg-blue-600 text-white dark:bg-blue-700">
                <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-blue-50">
                        <Sparkles className="h-4 w-4" />Learn something new today
                    </div>

                    <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                        Welcome to StudyHub
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                        Find practical courses, learn at your own pace, and keep your progress in one place.
                    </p>

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <button
                            onClick={() => go("courses")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                            Explore Courses <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => go("register")}
                            className="rounded-xl border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Create an Account
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-blue-100">
                        <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Structured learning</span>
                        <span className="inline-flex items-center gap-2"><Award className="h-4 w-4" />Progress certificates</span>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
                    {[
                        [BookOpen, courses.length, "Courses"],
                        [Users, stats.students.toLocaleString(), "Learners"],
                        [GraduationCap, stats.lessons, "Lessons"],
                        [Star, stats.rating, "Average Rating"]
                    ].map(([Icon, value, label]) => (
                        <div key={label} className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                <Icon className={`h-6 w-6 ${label === "Average Rating" ? "fill-blue-600" : ""}`} />
                            </div>
                            <p className="text-2xl font-extrabold">{value}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="mb-10 flex items-end justify-between gap-5">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    Explore
                                </p>
                                <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                                    Browse by Category
                                </h2>
                                <p className="mt-3 text-slate-600 dark:text-slate-300">
                                    Explore courses based on your interests and learning goals.
                                </p>
                            </div>

                            <button
                                onClick={() => go("courses")}
                                className="hidden items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 sm:flex"
                            >
                                View All <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {categories.slice(0, 8).map((cat, i) => {
                                const name = cat.name || cat.title || "Category";
                                const count = cat.courseCount ?? cat.count ?? 0;
                                const categoryCourse = courses.find(course =>
                                    (course.category || "").toLowerCase() === name.toLowerCase() && course.thumbnail
                                );

                                return (
                                    <button
                                        key={cat._id || `${name}-${i}`}
                                        onClick={() => go("courses", { category: name })}
                                        className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-100 via-sky-50 to-blue-200 dark:from-blue-950 dark:via-slate-800 dark:to-slate-700">
                                            <div className="absolute inset-0 flex items-center justify-center text-blue-600/40 dark:text-blue-300/40">
                                                <BookOpen className="h-12 w-12" />
                                            </div>
                                            {categoryCourse?.thumbnail && (
                                                <img
                                                    src={categoryCourse.thumbnail}
                                                    alt={`${name} course`}
                                                    loading="lazy"
                                                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    onError={event => { event.currentTarget.style.display = "none"; }}
                                                />
                                            )}
                                            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm dark:bg-slate-950/85 dark:text-blue-300">
                                                {count} {count === 1 ? "course" : "courses"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 p-4">
                                            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{name}</h3>
                                            <ArrowRight className="h-4 w-4 text-blue-500 group-hover:translate-x-1" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Courses */}
            <section className="bg-white py-20 dark:bg-slate-950">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Learning
                            </p>
                            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                                Featured Courses
                            </h2>
                            <p className="mt-3 text-slate-600 dark:text-slate-300">
                                Discover courses designed to help you develop practical and
                                career-focused skills.
                            </p>
                        </div>

                        <button
                            onClick={() => go("courses")}
                            className="inline-flex items-center gap-2 self-start rounded-xl border border-blue-200 px-5 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-slate-900"
                        >
                            View All Courses <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mb-8 flex flex-wrap gap-2">
                        {[
                            ["all", "All Courses"],
                            ["popular", "Popular"],
                            ["topRated", "Top Rated"]
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${activeTab === key
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 8 }, (_, i) => (
                                <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="aspect-[16/9] animate-pulse bg-blue-50 dark:bg-slate-800" />
                                    <div className="space-y-4 p-5">
                                        <div className="h-4 w-20 animate-pulse rounded bg-blue-50 dark:bg-slate-800" />
                                        <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                        <div className="h-10 animate-pulse rounded bg-blue-50 dark:bg-slate-800" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : featured.length ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {featured.map(course => (
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    onSelect={id => go("course-details", { courseId: id })}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
                            <BookOpen className="mx-auto h-12 w-12 text-blue-600" />
                            <h3 className="mt-5 text-xl font-bold">No courses available</h3>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Courses will appear here when they are published.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Why StudyHub */}
            <section className="bg-blue-50/60 py-20 dark:bg-slate-900/50">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Why StudyHub
                        </p>
                        <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                            Everything You Need to Learn
                        </h2>
                        <p className="mt-4 text-slate-600 dark:text-slate-300">
                            A simple and modern learning experience designed for students
                            and professionals.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {features.map(([Icon, title, text]) => (
                            <div
                                key={title}
                                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-900"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className="bg-white py-20 dark:bg-slate-950">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <p className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Simple Process
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                        Start Learning in 3 Steps
                    </h2>

                    <div className="mt-14 grid gap-8 md:grid-cols-3">
                        {steps.map(([num, title, text]) => (
                            <div key={num}>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-extrabold text-white shadow-lg">
                                    {num}
                                </div>
                                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white px-4 pb-20 dark:bg-slate-950">
                <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-14 text-center shadow-2xl sm:px-12">
                    <div className="mx-auto max-w-3xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                            <Sparkles className="h-7 w-7 text-amber-300" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
                            Ready to Start Learning?
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                            Explore StudyHub courses and take the next step in your learning journey.
                        </p>
                        <button
                            onClick={() => go("courses")}
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-blue-600 shadow-xl hover:bg-blue-50"
                        >
                            Explore Courses <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>

        </main>
    );
};

export default HomePage;
