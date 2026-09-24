import React, { useState } from "react";
import { BookOpen, Save, ArrowLeft } from "lucide-react";
import { api } from "../services/api.js";

export const CreateCoursePage = ({ setCurrentView }) => {
    const [form, setForm] = useState({
        title: "", description: "", category: "", price: "",
        level: "Beginner", duration: "", language: "English", thumbnail: ""
    });
    const [msg, setMsg] = useState("");

    const change = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        setMsg("");
        try {
            await api.createCourse({ ...form, price: Number(form.price || 0) });
            setMsg("Course created successfully.");
            setTimeout(() => setCurrentView("instructor-courses"), 600);
        } catch (err) {
            setMsg(err.message);
        }
    };

    const fields = [
        ["title", "Course Title"],
        ["category", "Category"],
        ["price", "Price"],
        ["duration", "Duration"],
        ["language", "Language"],
        ["thumbnail", "Thumbnail URL"]
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto p-4 sm:p-8">

                <button
                    onClick={() => setCurrentView("instructor-dashboard")}
                    className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <header className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                        <BookOpen className="h-7 w-7 text-gray-800" />
                    </div>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        Create Course
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Publish a structured learning experience for students.
                    </p>
                </header>

                {msg && (
                    <div className="mt-5 rounded-xl border bg-gray-50 p-4 text-sm font-medium">
                        {msg}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="mt-6 grid gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-2"
                >
                    {fields.map(([name, label]) => (
                        <label key={name}>
                            <span className="text-sm font-semibold text-gray-800">
                                {label}
                            </span>
                            <input
                                name={name}
                                type={name === "price" ? "number" : "text"}
                                required={["title", "category"].includes(name)}
                                value={form[name]}
                                onChange={change}
                                className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                            />
                        </label>
                    ))}

                    <label>
                        <span className="text-sm font-semibold text-gray-800">Level</span>
                        <select
                            name="level"
                            value={form.level}
                            onChange={change}
                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </label>

                    <label className="md:col-span-2">
                        <span className="text-sm font-semibold text-gray-800">
                            Description
                        </span>
                        <textarea
                            name="description"
                            required
                            rows={6}
                            value={form.description}
                            onChange={change}
                            placeholder="Write a clear description of your course..."
                            className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        />
                    </label>

                    <button
                        type="submit"
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                        <Save className="h-4 w-4" />
                        Create Course
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCoursePage;