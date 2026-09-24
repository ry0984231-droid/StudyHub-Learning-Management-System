import React, { useEffect, useState } from "react";
import {
    BookOpen,
    Search,
    SlidersHorizontal,
    ArrowLeft,
    GraduationCap,
} from "lucide-react";
import { CourseCard } from "../components/CourseCard.jsx";
import { api } from "../services/api.js";

export const CoursesPage = ({
    initialSearch = "",
    initialCategory = "All",
    setCurrentView,
}) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const params = {
                    ...(initialSearch.trim() && { search: initialSearch.trim() }),
                    ...(initialCategory !== "All" && { category: initialCategory }),
                };
                const res = await api.getCourses(params);
                setCourses(res.success && Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to load courses:", err);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [initialSearch, initialCategory]);

    const goHome = () => setCurrentView("home");

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
            {/* Header */}
            <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:px-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                            <BookOpen className="h-5 w-5" />
                            Course Library
                        </div>
                        <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
                            Explore <span className="text-blue-600">Courses</span>
                        </h1>
                        <p className="max-w-2xl mx-auto mt-3 text-sm sm:text-base leading-6 text-slate-600 dark:text-slate-300">
                            Browse available courses, learn at your own pace, and build
                            practical knowledge through StudyHub.
                        </p>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Active Filters */}
                {(initialSearch.trim() || initialCategory !== "All") && (
                    <div className="mb-7 rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {initialSearch.trim() ? (
                                    <Search className="h-4 w-4 text-blue-600" />
                                ) : (
                                    <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                                )}
                                Active Filters
                            </div>

                            {initialSearch.trim() && (
                                <span className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    Search: "{initialSearch}"
                                </span>
                            )}

                            {initialCategory !== "All" && (
                                <span className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    Category: {initialCategory}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Section Header */}
                {!loading && courses.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                StudyHub Courses
                            </p>
                            <h2 className="mt-1 text-2xl font-bold">Available Courses</h2>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                Choose a course and start learning.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            {courses.length} {courses.length === 1 ? "Course" : "Courses"}
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="rounded-xl border border-slate-200 bg-white py-20 text-center dark:border-slate-800 dark:bg-slate-900">
                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            Loading courses...
                        </p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Please wait while we fetch available courses.
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!loading && !courses.length && (
                    <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                            <BookOpen className="h-7 w-7 text-blue-600" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold">No Courses Found</h2>
                        <p className="max-w-md mx-auto mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            We couldn't find any courses matching your current search or
                            category.
                        </p>

                        <button
                            onClick={goHome}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </button>
                    </div>
                )}

                {/* Courses */}
                {!loading && courses.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map(course => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                onSelect={id => {
                                    if (!id) {
                                        console.error("Course ID is missing:", course);
                                        return;
                                    }
                                    setCurrentView("course-details", { courseId: id });
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Bottom Info */}
                {!loading && courses.length > 0 && (
                    <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <GraduationCap className="h-6 w-6" />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-sm font-bold">
                                    Continue Your Learning
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    Select a course from the collection and start learning
                                    through StudyHub.
                                </p>
                            </div>

                            <button
                                onClick={goHome}
                                className="inline-flex items-center justify-center rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-slate-800"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoursesPage;
