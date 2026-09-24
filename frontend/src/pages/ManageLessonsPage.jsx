import React, { useEffect, useState } from "react";
import {
    BookOpen,
    Plus,
    Trash2,
    Edit3,
    ArrowLeft,
} from "lucide-react";

import { api } from "../services/api.js";

export const ManageLessonsPage = ({ courseId, setCurrentView }) => {
    const [lessons, setLessons] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            setLoading(true);

            const [c, l] = await Promise.all([
                api.getCourse(courseId),
                api.getLessons(courseId),
            ]);

            setCourse(c?.data || c);
            setLessons(l?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            load();
        }
    }, [courseId]);

    const remove = async (id) => {
        if (!confirm("Delete this lesson?")) return;

        try {
            await api.deleteLesson(id);

            setLessons((prev) =>
                prev.filter((lesson) => lesson._id !== id)
            );
        } catch (e) {
            alert(e.message || "Failed to delete lesson.");
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8">

                {/* Header */}
                <div className="mb-7 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end">

                    <div>
                        <button
                            onClick={() =>
                                setCurrentView("instructor-dashboard")
                            }
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </button>

                        <p className="text-sm font-semibold text-blue-600">
                            Course Management
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                            Manage Lessons
                        </h1>

                        <p className="mt-1 text-gray-500">
                            {course?.title || "Course"}
                        </p>
                    </div>

                    {/* Add Lesson */}
                    <button
                        onClick={() =>
                            setCurrentView("instructor-add-lesson", {
                                courseId,
                            })
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Lesson
                    </button>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    </div>
                ) : (
                    <div className="space-y-3">

                        {/* Lessons */}
                        {lessons.map((lesson, index) => (
                            <div
                                key={lesson._id}
                                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                            >
                                {/* Lesson Number */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                                    {index + 1}
                                </div>

                                {/* Lesson Info */}
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-bold text-gray-900">
                                        {lesson.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {lesson.duration || "Lesson"}

                                        {lesson.isPreview && (
                                            <span className="text-blue-600">
                                                {" "}
                                                • Free preview
                                            </span>
                                        )}
                                    </p>

                                    {lesson.moduleTitle && (
                                        <p className="mt-1 text-xs text-gray-400">
                                            {lesson.moduleTitle}
                                        </p>
                                    )}
                                </div>

                                {/* Edit */}
                                <button
                                    onClick={() =>
                                        setCurrentView("instructor-edit-lesson", {
                                            lessonId: lesson._id,
                                            courseId,
                                        })
                                    }
                                    className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                                    title="Edit lesson"
                                >
                                    <Edit3 className="h-4 w-4" />
                                </button>

                                {/* Delete */}
                                <button
                                    onClick={() => remove(lesson._id)}
                                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                    title="Delete lesson"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {/* Empty State */}
                        {!lessons.length && (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">

                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                                    <BookOpen className="h-7 w-7 text-gray-400" />
                                </div>

                                <p className="mt-3 font-semibold text-gray-700">
                                    No lessons added yet.
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Add your first lesson to start building this course.
                                </p>

                                <button
                                    onClick={() =>
                                        setCurrentView("instructor-add-lesson", {
                                            courseId,
                                        })
                                    }
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add First Lesson
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageLessonsPage;