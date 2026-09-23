import React, { useEffect, useState } from "react";
import {
    Shield,
    Users,
    BookOpen,
    CreditCard,
    Award,
    Search,
    Eye,
    Trash2,
} from "lucide-react";
import { api } from "../services/api.js";

export const AdminDashboard = ({ setCurrentView }) => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("users");
    const [searchTerm, setSearchTerm] = useState("");

    // =========================
    // LOAD ADMIN DATA
    // =========================
    const loadAdminData = async () => {
        setLoading(true);

        try {
            const [statRes, userRes, courseRes, payRes] = await Promise.all([
                api.getAdminStats(),
                api.getAdminUsers(),
                api.getInstructorCourses(),
                api.getAdminPayments(),
            ]);

            if (statRes?.success) {
                setStats(statRes.metrics);
            }

            if (userRes?.success) {
                setUsers(userRes.data || []);
            }

            if (courseRes?.success) {
                setCourses(courseRes.data || []);
            }

            if (payRes?.success) {
                setPayments(payRes.data || []);
            }
        } catch (err) {
            console.error("Admin dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    // =========================
    // UPDATE USER ROLE
    // =========================
    const handleUpdateRole = async (userId, newRole) => {
        try {
            const res = await api.updateUserRole(userId, newRole);

            if (res?.success) {
                setUsers((prev) =>
                    prev.map((user) =>
                        user._id === userId
                            ? { ...user, role: newRole }
                            : user
                    )
                );
            }
        } catch (err) {
            alert(err.message || "Failed to update role");
        }
    };

    // =========================
    // DELETE COURSE
    // =========================
    const handleDeleteCourse = async (courseId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this course from the catalogue?"
        );

        if (!confirmed) return;

        try {
            const res = await api.deleteCourse(courseId);

            if (res?.success) {
                setCourses((prev) =>
                    prev.filter((course) => course._id !== courseId)
                );
            }
        } catch (err) {
            alert(err.message || "Failed to delete course");
        }
    };

    // =========================
    // FILTER USERS
    // =========================
    const filteredUsers = users.filter((user) => {
        const name = user.name || "";
        const email = user.email || "";
        const role = user.role || "";

        const search = searchTerm.toLowerCase();

        return (
            name.toLowerCase().includes(search) ||
            email.toLowerCase().includes(search) ||
            role.toLowerCase().includes(search)
        );
    });

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="min-h-[70vh] bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

                    <p className="mt-4 text-sm text-gray-500">
                        Loading admin dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* =========================================
            HEADER
        ========================================= */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                            <Shield className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                        </div>

                        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
                            Platform Administration
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Manage users, courses, payments and platform activity.
                        </p>
                    </div>
                </div>

                {/* =========================================
            STATISTICS
        ========================================= */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mt-6">
                    {/* USERS */}
                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                                <Users className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-2xl font-extrabold text-gray-900">
                                    {stats?.totalUsers ?? users.length}
                                </p>

                                <p className="text-xs font-medium text-gray-500">
                                    Registered Users
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* COURSES */}
                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:scale-105 transition-transform">
                                <BookOpen className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-2xl font-extrabold text-gray-900">
                                    {stats?.totalCourses ?? courses.length}
                                </p>

                                <p className="text-xs font-medium text-gray-500">
                                    Total Courses
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* REVENUE */}
                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                                <CreditCard className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-2xl font-extrabold text-gray-900">
                                    ₹{Number(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}
                                </p>

                                <p className="text-xs font-medium text-gray-500">
                                    Platform Revenue
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CERTIFICATES */}
                    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                                <Award className="h-6 w-6" />
                            </div>

                            <div>
                                <p className="text-2xl font-extrabold text-gray-900">
                                    {stats?.certificatesCount ?? 0}
                                </p>

                                <p className="text-xs font-medium text-gray-500">
                                    Certificates
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================
            TABS
        ========================================= */}
                <div className="mt-8 flex items-center gap-2 overflow-x-auto border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab("users")}
                        className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition ${activeTab === "users"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        Users ({users.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("courses")}
                        className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition ${activeTab === "courses"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        Courses ({courses.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("payments")}
                        className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition ${activeTab === "payments"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        Transactions ({payments.length})
                    </button>
                </div>

                {/* =========================================
            USERS TAB
        ========================================= */}
                {activeTab === "users" && (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    User Management
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Search and manage registered platform users.
                                </p>
                            </div>

                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            User
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Email
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Role
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Joined
                                        </th>

                                        <th className="px-5 py-3 text-right font-semibold text-gray-500">
                                            Change Role
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="transition hover:bg-blue-50/40"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name || "User"}
                                                            className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                                            {(user.name || "U")
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}

                                                    <span className="font-semibold text-gray-900">
                                                        {user.name || "Unknown User"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {user.email || "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${user.role === "admin"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : user.role === "instructor"
                                                                ? "bg-sky-100 text-sky-700"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {user.role || "student"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-gray-500">
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                    : "-"}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <select
                                                    value={user.role || "student"}
                                                    onChange={(e) =>
                                                        handleUpdateRole(user._id, e.target.value)
                                                    }
                                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="instructor">Instructor</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="py-12 text-center">
                                <Users className="mx-auto h-10 w-10 text-gray-300" />

                                <p className="mt-3 font-semibold text-gray-500">
                                    No users found
                                </p>

                                <p className="mt-1 text-sm text-gray-400">
                                    Try a different search term.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================
            COURSES TAB
        ========================================= */}
                {activeTab === "courses" && (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-5">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Course Management
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Review and manage courses available on StudyHub.
                                </p>
                            </div>

                            <span className="whitespace-nowrap text-sm text-gray-500">
                                {courses.length} courses
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Course
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Instructor
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Category
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Price
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Students
                                        </th>

                                        <th className="px-5 py-3 text-right font-semibold text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {courses.map((course) => (
                                        <tr
                                            key={course._id}
                                            className="transition hover:bg-blue-50/40"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="h-10 w-14 rounded-lg object-cover ring-1 ring-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-gray-100">
                                                            <BookOpen className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}

                                                    <span className="max-w-xs truncate font-semibold text-gray-900">
                                                        {course.title || "Untitled Course"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {course.instructorName ||
                                                    course.instructor?.name ||
                                                    "Unknown"}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {course.category || "-"}
                                            </td>

                                            <td className="px-5 py-4 font-semibold text-gray-900">
                                                ₹
                                                {Number(course.price || 0).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {course.studentsCount ??
                                                    course.students ??
                                                    0}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentView("course-details", {
                                                            courseId: course._id,
                                                        })
                                                    }
                                                    className="inline-flex items-center gap-1.5 mr-3 font-semibold text-blue-600 transition hover:text-blue-800"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteCourse(course._id)
                                                    }
                                                    className="inline-flex items-center gap-1.5 font-semibold text-red-600 transition hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {courses.length === 0 && (
                            <div className="py-12 text-center">
                                <BookOpen className="mx-auto h-10 w-10 text-gray-300" />

                                <p className="mt-3 font-semibold text-gray-500">
                                    No courses available
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* =========================================
            PAYMENTS TAB
        ========================================= */}
                {activeTab === "payments" && (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-5">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Transactions & Payments
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Monitor platform payment and transaction records.
                                </p>
                            </div>

                            <span className="whitespace-nowrap text-sm text-gray-500">
                                {payments.length} transactions
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Invoice
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Student
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Course
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Amount
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Gateway
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right font-semibold text-gray-500">
                                            Date
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((payment) => (
                                        <tr
                                            key={payment._id}
                                            className="transition hover:bg-blue-50/40"
                                        >
                                            <td className="px-5 py-4 font-mono font-semibold text-blue-600">
                                                {payment.invoiceNumber || "-"}
                                            </td>

                                            <td className="px-5 py-4 text-gray-700">
                                                {payment.userName ||
                                                    payment.user?.name ||
                                                    "-"}
                                            </td>

                                            <td className="max-w-xs truncate px-5 py-4 text-gray-700">
                                                {payment.courseTitle ||
                                                    payment.course?.title ||
                                                    "-"}
                                            </td>

                                            <td className="px-5 py-4 font-semibold text-gray-900">
                                                ₹
                                                {Number(payment.amount || 0).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-gray-500">
                                                {payment.paymentMethod || "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                                                    {payment.status || "success"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right text-gray-500">
                                                {payment.createdAt
                                                    ? new Date(
                                                        payment.createdAt
                                                    ).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {payments.length === 0 && (
                            <div className="py-12 text-center">
                                <CreditCard className="mx-auto h-10 w-10 text-gray-300" />

                                <p className="mt-3 font-semibold text-gray-500">
                                    No transactions available
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
