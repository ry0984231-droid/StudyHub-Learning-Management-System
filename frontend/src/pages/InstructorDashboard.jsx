import React, { useEffect, useState } from "react";
import {
    PlusCircle, BookOpen, Users, DollarSign, Star, Eye, FilePlus,
    BarChart3, TrendingUp, GraduationCap, Layers3, ArrowUpRight,
    MoreHorizontal, Search, RefreshCw, CheckCircle2, Clock3, Sparkles
} from "lucide-react";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    Tooltip, CartesianGrid
} from "recharts";
import { Modal } from "../components/Modal.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export const InstructorDashboard = ({ setCurrentView }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState("Web Development");
    const [newLevel, setNewLevel] = useState("Intermediate");
    const [newPrice, setNewPrice] = useState("49.99");
    const [newThumbnail, setNewThumbnail] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newOutcomes, setNewOutcomes] = useState(
        "Build production microservices\nMaster asynchronous workflows\nDeploy to cloud clusters"
    );
    const [submittingCourse, setSubmittingCourse] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const [res, statsRes] = await Promise.all([
                api.getInstructorCourses(),
                api.getInstructorStats()
            ]);

            if (res.success) {
                setCourses((res.data || []).filter(c =>
                    user?.role === "admin" ||
                    c.instructorId === user?._id ||
                    c.instructor?._id === user?._id
                ));
            }

            if (statsRes.success) {
                setDashboardStats(statsRes.stats);
                setRevenueData(
                    (statsRes.charts?.monthlyEnrollments || []).map(x => ({
                        month: x.month,
                        revenue: Number(x.revenue || 0),
                        students: Number(x.count || 0)
                    }))
                );
            }
        } catch (err) {
            console.error("Instructor dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchCourses();
    }, [user]);

    const resetCourseForm = () => {
        setNewTitle("");
        setNewDescription("");
        setNewThumbnail("");
        setNewPrice("49.99");
        setNewCategory("Web Development");
        setNewLevel("Intermediate");
        setNewOutcomes(
            "Build production microservices\nMaster asynchronous workflows\nDeploy to cloud clusters"
        );
    };

    const handleCreateCourse = async e => {
        e.preventDefault();

        if (!newTitle.trim()) return alert("Please enter course title.");
        if (!newDescription.trim()) return alert("Please enter course description.");

        setSubmittingCourse(true);
        try {
            const outcomesArray = newOutcomes
                .split("\n")
                .map(x => x.trim())
                .filter(Boolean);

            const res = await api.createCourse({
                title: newTitle.trim(),
                category: newCategory,
                level: newLevel,
                price: parseFloat(newPrice) || 0,
                thumbnail: newThumbnail.trim(),
                description: newDescription.trim(),
                learningOutcomes: outcomesArray,
                duration: "14h 30m"
            });

            if (res.success) {
                setIsCreateModalOpen(false);
                resetCourseForm();
                await fetchCourses();
                alert("Course created successfully!");
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to create course.");
        } finally {
            setSubmittingCourse(false);
        }
    };

    const totalCourses = dashboardStats?.totalCourses ?? courses.length;
    const totalStudents = dashboardStats?.totalStudents ?? 0;
    const totalRevenue = dashboardStats?.totalRevenue ?? 0;
    const averageRating = dashboardStats?.averageRating ?? 0;
    const publishedCourses = courses.filter(c => c.published).length;
    const draftCourses = courses.filter(c => !c.published).length;

    const filteredCourses = courses.filter(c => {
        const s = searchTerm.toLowerCase();
        return c.title?.toLowerCase().includes(s) ||
            c.category?.toLowerCase().includes(s) ||
            c.level?.toLowerCase().includes(s);
    });

    const go = (view, params) => setCurrentView(view, params);

    if (loading) {
        return (
            <div className="flex min-h-[75vh] items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="mt-4 text-sm font-medium text-gray-500">
                        Loading instructor dashboard...
                    </p>
                </div>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, value, label, badge, iconClass }) => (
        <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${iconClass}`}>
                    {badge}
                </span>
            </div>
            <p className="mt-5 text-3xl font-extrabold text-gray-900">{value}</p>
            <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f7f9fc]">
            <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">

                {/* Header */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                                <Sparkles className="h-3.5 w-3.5" /> Instructor Workspace
                            </div>

                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                                Welcome back, {user?.name || "Instructor"} 👋
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                                Manage your courses, lessons and students from one simple
                                learning management dashboard.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                                >
                                    <PlusCircle className="h-4 w-4" /> Create Course
                                </button>

                                <button
                                    type="button"
                                    onClick={fetchCourses}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                                >
                                    <RefreshCw className="h-4 w-4" /> Refresh
                                </button>
                            </div>
                        </div>

                        <div className="hidden lg:flex lg:items-center lg:gap-4">
                            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-extrabold text-blue-600">
                                        {user?.name?.charAt(0)?.toUpperCase() || "I"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{user?.name || "Instructor"}</p>
                                        <p className="text-xs text-blue-100">
                                            {user?.email || "Instructor Account"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        {
                            icon: PlusCircle,
                            title: "Create New Course",
                            text: "Start building your next learning experience.",
                            color: "blue",
                            action: () => setIsCreateModalOpen(true)
                        },
                        {
                            icon: FilePlus,
                            title: "Add New Lesson",
                            text: "Add videos, lessons and learning material.",
                            color: "indigo",
                            action: () => go("instructor-add-lesson")
                        },
                        {
                            icon: Layers3,
                            title: "Manage Courses",
                            text: "View and manage all your created courses.",
                            color: "emerald",
                            action: () => document.getElementById("my-courses")?.scrollIntoView({ behavior: "smooth" })
                        }
                    ].map(({ icon: Icon, title, text, color, action }) => (
                        <button
                            key={title}
                            type="button"
                            onClick={action}
                            className={`group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-${color}-200 hover:shadow-lg`}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-${color}-50 text-${color}-600`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <ArrowUpRight className={`h-4 w-4 text-gray-300 transition group-hover:text-${color}-600`} />
                            </div>
                            <h3 className="mt-4 font-bold text-gray-900">{title}</h3>
                            <p className="mt-1 text-xs text-gray-500">{text}</p>
                        </button>
                    ))}
                </section>

                {/* Statistics */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={BookOpen}
                        value={totalCourses}
                        label="Total Courses"
                        badge="Active"
                        iconClass="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        icon={Users}
                        value={totalStudents.toLocaleString()}
                        label="Total Students"
                        badge="Learners"
                        iconClass="bg-violet-50 text-violet-600"
                    />
                    <StatCard
                        icon={DollarSign}
                        value={`₹${Number(totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        label="Total Revenue"
                        badge="Revenue"
                        iconClass="bg-emerald-50 text-emerald-600"
                    />
                    <StatCard
                        icon={Star}
                        value={averageRating ? Number(averageRating).toFixed(1) : "—"}
                        label="Average Rating"
                        badge="Reviews"
                        iconClass="bg-amber-50 text-amber-600"
                    />
                </section>

                {/* Analytics */}
                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <BarChart3 className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-lg font-extrabold text-gray-900">
                                        Revenue Overview
                                    </h2>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Monthly revenue and enrollment performance
                                </p>
                            </div>
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                                <TrendingUp className="h-3 w-3" /> Recent Activity
                            </span>
                        </div>

                        <div className="h-72 w-full">
                            {!revenueData.length ? (
                                <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-gray-50">
                                    <BarChart3 className="h-10 w-10 text-gray-300" />
                                    <p className="mt-3 text-sm font-bold text-gray-600">
                                        No analytics data yet
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Revenue data will appear here as students enroll.
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={revenueData}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                borderColor: "#e5e7eb",
                                                borderRadius: "14px",
                                                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                                                fontSize: "12px"
                                            }}
                                            formatter={value => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#2563eb"
                                            strokeWidth={3}
                                            fill="url(#revenueGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Course Status */}
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <GraduationCap className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-extrabold text-gray-900">Course Status</h2>
                                <p className="text-xs text-gray-500">Your publishing overview</p>
                            </div>
                        </div>

                        <div className="mt-7 space-y-5">
                            {[
                                ["Published", publishedCourses, "bg-emerald-500"],
                                ["Drafts", draftCourses, "bg-amber-400"]
                            ].map(([label, count, color]) => (
                                <div key={label}>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-600">{label}</span>
                                        <span className="text-sm font-extrabold text-gray-900">{count}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className={`h-full rounded-full ${color} transition-all`}
                                            style={{
                                                width: totalCourses
                                                    ? `${Math.min(100, count / totalCourses * 100)}%`
                                                    : "0%"
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-7 rounded-2xl bg-gray-50 p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                                <div>
                                    <p className="text-xs font-bold text-gray-800">
                                        Keep your courses updated
                                    </p>
                                    <p className="mt-1 text-[11px] leading-5 text-gray-500">
                                        Add lessons and learning material regularly to improve the
                                        student experience.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* My Courses */}
                <section id="my-courses" className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">My Courses</h2>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    Manage your courses and learning content
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Search courses..."
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-xs font-medium text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:w-56"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                            >
                                <PlusCircle className="h-4 w-4" /> New Course
                            </button>
                        </div>
                    </div>

                    {!filteredCourses.length ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                                <BookOpen className="h-7 w-7 text-gray-300" />
                            </div>
                            <h3 className="mt-4 text-sm font-extrabold text-gray-700">
                                {searchTerm ? "No courses found" : "No courses yet"}
                            </h3>
                            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">
                                {searchTerm
                                    ? "Try searching with a different course title, category or level."
                                    : "Create your first course and start building your learning content."}
                            </p>
                            {!searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                                >
                                    Create Your First Course
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                            <table className="w-full min-w-[1050px] text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/80 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                                        {["Course", "Category", "Level", "Price", "Students", "Rating", "Status", "Actions"].map(x =>
                                            <th key={x} className="px-4 py-4">{x}</th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCourses.map(course => (
                                        <tr
                                            key={course._id}
                                            className="border-b border-gray-100 transition last:border-0 hover:bg-blue-50/30"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                                        {course.thumbnail ? (
                                                            <img
                                                                src={course.thumbnail}
                                                                alt={course.title}
                                                                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                                                                <BookOpen className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="max-w-[250px] truncate text-sm font-extrabold text-gray-900">
                                                            {course.title}
                                                        </p>
                                                        <p className="mt-1 text-[10px] text-gray-400">
                                                            {course.duration || "14h 30m"} •{" "}
                                                            {course.lessonsCount ?? course.lessons?.length ?? 0} lessons
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[10px] font-bold text-gray-600">
                                                    {course.category || "General"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                    {course.level || "Intermediate"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="text-sm font-extrabold text-gray-900">
                                                    ₹{Number(course.price || 0).toLocaleString()}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                    <Users className="h-3.5 w-3.5 text-gray-400" />
                                                    {course.studentsCount ?? course.students ?? 0}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-xs font-bold text-gray-700">
                                                        {Number(course.rating || 0).toFixed(1)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold ${course.published
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-amber-50 text-amber-600"
                                                    }`}>
                                                    {course.published
                                                        ? <CheckCircle2 className="h-3 w-3" />
                                                        : <Clock3 className="h-3 w-3" />}
                                                    {course.published ? "Published" : "Draft"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => go("instructor-add-lesson", { courseId: course._id })}
                                                        title="Add Lesson"
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-extrabold text-white transition hover:bg-blue-700"
                                                    >
                                                        <FilePlus className="h-3.5 w-3.5" /> Lesson
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => go("instructor-manage-lessons", { courseId: course._id })}
                                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-extrabold text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        Manage
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => go("course-details", { courseId: course._id })}
                                                        title="View Course"
                                                        className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="More"
                                                        className="rounded-lg border border-gray-200 bg-white p-2 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {/* Create Course Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => !submittingCourse && setIsCreateModalOpen(false)}
                title="Create New Course"
                maxWidth="2xl"
            >
                <form onSubmit={handleCreateCourse} className="space-y-5 text-sm">
                    <div className="rounded-2xl bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900">
                                    Build a new learning experience
                                </h3>
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    Add the basic course information below. You can add lessons
                                    after publishing.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-700">
                            Course Title
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Full Stack MERN Development"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">Category</label>
                            <select
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                            >
                                <option>Web Development</option>
                                <option>Machine Learning</option>
                                <option>Cloud & DevOps</option>
                                <option>Cybersecurity</option>
                                <option>Mobile Development</option>
                                <option>Data Science</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">Level</label>
                            <select
                                value={newLevel}
                                onChange={e => setNewLevel(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-gray-700">
                                Price (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={newPrice}
                                onChange={e => setNewPrice(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-700">
                            Thumbnail URL
                        </label>
                        <input
                            type="url"
                            value={newThumbnail}
                            onChange={e => setNewThumbnail(e.target.value)}
                            placeholder="https://example.com/course-image.jpg"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-700">
                            Course Description
                        </label>
                        <textarea
                            rows={4}
                            required
                            placeholder="Describe what students will learn in this course..."
                            value={newDescription}
                            onChange={e => setNewDescription(e.target.value)}
                            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-700">
                            Learning Outcomes
                        </label>
                        <p className="mb-2 text-[11px] text-gray-400">
                            Enter one outcome per line.
                        </p>
                        <textarea
                            rows={4}
                            value={newOutcomes}
                            onChange={e => setNewOutcomes(e.target.value)}
                            placeholder={"Build production applications\nMaster backend APIs\nDeploy applications to the cloud"}
                            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            disabled={submittingCourse}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submittingCourse}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submittingCourse ? (
                                <>
                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="h-4 w-4" /> Publish Course
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InstructorDashboard;