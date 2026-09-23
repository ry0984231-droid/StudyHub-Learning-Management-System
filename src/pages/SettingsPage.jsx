import React, { useState } from "react";
import {
    Check,
    User,
    Mail,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";

export const SettingsPage = () => {
    const { user, updateUser } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (trimmedName.length < 2) {
            setErrorMsg("Please enter a name with at least 2 characters.");
            setSuccessMsg("");
            return;
        }

        setSaving(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const response = await api.updateProfile({ name: trimmedName });
            if (!response?.success) throw new Error(response?.message || "Could not save profile.");
            updateUser(response.user || { name: trimmedName });
            setName(trimmedName);
            setSuccessMsg("Profile updated successfully.");
        } catch (error) {
            setErrorMsg(error.message || "Could not save profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* =====================================================
                HEADER
            ===================================================== */}
            <section className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-4xl px-4 py-8 text-center sm:px-6">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Settings
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Manage your account information.
                    </p>
                </div>
            </section>

            {/* =====================================================
                CONTENT
            ===================================================== */}
            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}
                {successMsg && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <Check className="h-4 w-4" />
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMsg}
                    </div>
                )}

                {/* =================================================
                    PROFILE
                ================================================= */}
                <section className="rounded-xl border border-gray-200 bg-white">

                    {/* Section Header */}
                    <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>

                        <h2 className="text-base font-semibold text-gray-900">
                            Profile
                        </h2>

                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSaveProfile}
                        className="space-y-5 p-5"
                    >

                        {/* Full Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>

                            <div className="relative">

                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Enter your name"
                                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <div className="relative">

                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-500"
                                />

                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="border-t border-gray-100 pt-4">

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>

                        </div>

                    </form>
                </section>

            </main>
        </div>
    );
};

export default SettingsPage;
