import React, { useState } from "react";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export const LoginPage = ({ setCurrentView }) => {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const change = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const redirect = role =>
        setCurrentView(
            role === "admin"
                ? "admin-dashboard"
                : role === "instructor"
                    ? "instructor-dashboard"
                    : "student-dashboard"
        );

    const submit = async e => {
        e.preventDefault();

        if (!form.email || !form.password)
            return setError("Please enter email and password.");

        try {
            setLoading(true);
            setError("");

            const res = await login(form.email, form.password);

            if (res.success) redirect(res.user.role);
            else setError(res.message || "Invalid email or password.");
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <GraduationCap className="h-8 w-8" />
                    </div>
                    <h1 className="mt-3 text-2xl font-bold text-slate-900">StudyHub</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Learning Management System
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <h2 className="text-center text-2xl font-bold text-slate-900">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        Login to continue learning
                    </p>

                    {error && (
                        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-6 space-y-5">

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={change}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-2 flex justify-between">
                                <label className="text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setCurrentView("forgot-password")}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                <input
                                    name="password"
                                    type={show ? "text" : "password"}
                                    value={form.password}
                                    onChange={change}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                                >
                                    {show ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {/* Register */}
                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setCurrentView("register")}
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            Create Account
                        </button>
                    </p>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                    © 2026 StudyHub. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;