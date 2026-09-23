import React, { useState } from "react";
import {
    GraduationCap,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export const RegisterPage = ({ setCurrentView }) => {
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedEmail || !password)
            return setError("Please fill all fields.");

        if (trimmedName.length < 2)
            return setError("Please enter a valid name.");

        if (password.length < 8)
            return setError("Password must contain at least 8 characters.");

        try {
            setLoading(true);

            const res = await register(
                trimmedName,
                trimmedEmail,
                password,
                role
            );

            if (res.success) {
                setCurrentView(
                    res.user?.role === "instructor"
                        ? "instructor-dashboard"
                        : "student-dashboard"
                );
            } else {
                setError(res.message || "Registration failed.");
            }
        } catch (err) {
            setError(
                err?.message || "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[85vh] items-center justify-center bg-gray-50 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <GraduationCap className="h-6 w-6" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Create Account
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Join StudyHub and start learning.
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>

                            <div className="flex items-center rounded-xl border border-gray-200 px-3 focus-within:border-blue-600">
                                <User className="h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full border-0 p-3 text-sm outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <div className="flex items-center rounded-xl border border-gray-200 px-3 focus-within:border-blue-600">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full border-0 p-3 text-sm outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="account-role"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                I want to join as
                            </label>
                            <select
                                id="account-role"
                                name="role"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-blue-600"
                            >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-400">
                                Admin access is assigned by an existing administrator.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <div className="flex items-center rounded-xl border border-gray-200 px-3 focus-within:border-blue-600">
                                <Lock className="h-4 w-4 text-gray-400" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    placeholder="Create password"
                                    value={password}
                                    onChange={e =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full border-0 p-3 text-sm outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            <p className="mt-1 text-xs text-gray-400">
                                Minimum 8 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setCurrentView("login")}
                            className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Sign in
                        </button>
                    </p>
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                    StudyHub • Learning Management System
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
