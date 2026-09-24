import React, { useEffect, useState } from "react";
import {
    Save, ArrowLeft, Video, CheckCircle2, AlertCircle,
    Upload, FileVideo, X
} from "lucide-react";
import { api } from "../services/api.js";

export const AddLessonPage = ({ courseId, setCurrentView }) => {
    const [form, setForm] = useState({
        title: "", description: "", duration: "", isPreview: false
    });
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState("");
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => () => videoPreview && URL.revokeObjectURL(videoPreview), [videoPreview]);

    const change = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
        setMsg(""); setError("");
    };

    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        setMsg(""); setError("");
        if (!file) return;

        const types = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
        if (!types.includes(file.type)) {
            setError("Invalid video format. Please upload MP4, WebM, MOV or AVI.");
            e.target.value = "";
            return;
        }

        if (file.size > 500 * 1024 * 1024) {
            setError("Video size must be less than 500 MB.");
            e.target.value = "";
            return;
        }

        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
    };

    const removeVideo = () => {
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoFile(null); setVideoPreview("");
        const input = document.getElementById("video");
        if (input) input.value = "";
        setMsg(""); setError("");
    };

    const submit = async (e) => {
        e.preventDefault();
        setMsg(""); setError("");

        if (!courseId) return setError("Course ID is missing. Please open Add Lesson from a course.");
        if (!form.title.trim()) return setError("Please enter the lesson title.");
        if (!videoFile) return setError("Please select a video file.");

        setSaving(true);
        try {
            const data = new FormData();
            data.append("courseId", courseId);
            data.append("title", form.title.trim());
            data.append("description", form.description.trim());
            data.append("duration", form.duration.trim());
            data.append("moduleTitle", "Module 1");
            data.append("videoType", "local");
            data.append("isFreePreview", String(form.isPreview));
            data.append("video", videoFile);

            await api.createLesson(data);
            setMsg("Lesson added successfully!");

            setTimeout(() => setCurrentView("instructor-manage-lessons", { courseId }), 1000);
        } catch (err) {
            console.error("Create lesson error:", err);
            setError(err?.message || "Failed to add lesson. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const formatFileSize = (bytes) =>
        !bytes ? "0 MB" :
            bytes / (1024 * 1024) < 1
                ? `${(bytes / 1024).toFixed(1)} KB`
                : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

    const back = () => setCurrentView("instructor-manage-lessons", { courseId });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">

                <button type="button" onClick={back}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4" /> Back to Lessons
                </button>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Video className="h-6 w-6" />
                    </div>
                    <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900">Add Lesson</h1>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Add a new video lesson to your course and provide students with learning content.
                    </p>
                </div>

                {msg && (
                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                        <CheckCircle2 className="h-5 w-5 shrink-0" /> <span>{msg}</span>
                    </div>
                )}

                {error && (
                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0" /> <span>{error}</span>
                    </div>
                )}

                <form onSubmit={submit}
                    className="mt-6 space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-800">
                            Lesson Title
                        </label>
                        <input id="title" name="title" type="text" required value={form.title}
                            onChange={change} placeholder="Enter lesson title"
                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                    </div>

                    <div>
                        <label htmlFor="video" className="block text-sm font-semibold text-gray-800">
                            Lesson Video
                        </label>

                        {!videoFile ? (
                            <label htmlFor="video"
                                className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                    <Upload className="h-7 w-7" />
                                </div>
                                <p className="mt-4 text-sm font-semibold text-gray-800">
                                    Click to upload your lesson video
                                </p>
                                <p className="mt-1 text-xs text-gray-500">MP4, WebM, MOV or AVI</p>
                                <p className="mt-1 text-xs text-gray-400">Maximum file size: 500 MB</p>
                                <input id="video" name="video" type="file"
                                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                                    onChange={handleVideoChange} className="hidden" />
                            </label>
                        ) : (
                            <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                                <div className="relative bg-black">
                                    <video src={videoPreview} controls className="max-h-[420px] w-full object-contain" />
                                </div>

                                <div className="flex items-center justify-between gap-4 p-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                            <FileVideo className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-gray-800">{videoFile.name}</p>
                                            <p className="mt-1 text-xs text-gray-500">{formatFileSize(videoFile.size)}</p>
                                        </div>
                                    </div>

                                    <button type="button" onClick={removeVideo}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                                        title="Remove video">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-800">
                            Description
                        </label>
                        <textarea id="description" name="description" rows={4}
                            value={form.description} onChange={change}
                            placeholder="Describe what students will learn in this lesson..."
                            className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                    </div>

                    <div>
                        <label htmlFor="duration" className="block text-sm font-semibold text-gray-800">
                            Duration
                        </label>
                        <input id="duration" name="duration" type="text"
                            value={form.duration} onChange={change} placeholder="12 min"
                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                        <input name="isPreview" type="checkbox" checked={form.isPreview} onChange={change}
                            className="mt-0.5 h-4 w-4 cursor-pointer accent-blue-600" />
                        <div>
                            <span className="text-sm font-semibold text-gray-800">
                                Allow students to preview this lesson
                            </span>
                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                Students can access this lesson before enrolling in the course.
                            </p>
                        </div>
                    </label>

                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <button type="button" disabled={saving} onClick={back}
                            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
                            Cancel
                        </button>

                        <button type="submit" disabled={saving || !videoFile}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                            <Save className="h-4 w-4" />
                            {saving ? "Uploading..." : "Add Lesson"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLessonPage;