import React, { useEffect, useState } from "react";
import {
  User,
  Save,
  Lock,
  Mail,
  Calendar,
} from "lucide-react";

import { api } from "../services/api.js";

export const ProfilePage = ({ setCurrentView }) => {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD PROFILE
  // =====================================================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.getMe();

        const currentUser =
          res?.data ||
          res?.user ||
          res;

        setUser(currentUser);

        setForm({
          name: currentUser?.name || "",
          dateOfBirth: currentUser?.dateOfBirth
            ? String(currentUser.dateOfBirth).slice(0, 10)
            : "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        setMessage(
          error.message || "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =====================================================
  // UPDATE PROFILE
  // =====================================================
  const saveProfile = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.updateProfile(form);

      const updatedUser =
        res?.data ||
        res?.user ||
        user;

      setUser(updatedUser);

      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(
        error.message ||
        "Failed to update profile."
      );
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================
  const changePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.changePassword(password);

      setPassword({
        currentPassword: "",
        newPassword: "",
      });

      setMessage("Password changed successfully.");
    } catch (error) {
      setMessage(
        error.message ||
        "Failed to change password."
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

        {/* =================================================
                    HEADER
                ================================================= */}
        <div className="mb-8 text-center">

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your profile and account password.
          </p>

        </div>

        {/* =================================================
                    MESSAGE
                ================================================= */}
        {message && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        {/* =================================================
                    PROFILE INFORMATION
                ================================================= */}
        <form
          onSubmit={saveProfile}
          className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6"
        >

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <User className="h-4 w-4 text-blue-600" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h2>

          </div>

          <div className="space-y-5">

            {/* FULL NAME */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                <User className="h-4 w-4 text-gray-400" />

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter your name"
                  className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
                />

              </div>

            </div>

            {/* EMAIL */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3">

                <Mail className="h-4 w-4 text-gray-400" />

                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed border-0 bg-transparent px-3 py-2.5 text-sm text-gray-500 outline-none"
                />

              </div>

            </div>

            {/* DATE OF BIRTH */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date of Birth
              </label>

              <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                <Calendar className="h-4 w-4 text-gray-400" />

                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dateOfBirth:
                        e.target.value,
                    })
                  }
                  className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
                />

              </div>

            </div>

            {/* SAVE */}
            <div className="pt-1">

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>

            </div>

          </div>
        </form>

        {/* =================================================
                    CHANGE PASSWORD
                ================================================= */}
        <form
          onSubmit={changePassword}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6"
        >

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
              <Lock className="h-4 w-4 text-purple-600" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Change Password
            </h2>

          </div>

          <div className="space-y-5">

            {/* CURRENT PASSWORD */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current Password
              </label>

              <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                <Lock className="h-4 w-4 text-gray-400" />

                <input
                  type="password"
                  value={
                    password.currentPassword
                  }
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      currentPassword:
                        e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
                />

              </div>

            </div>

            {/* NEW PASSWORD */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                New Password
              </label>

              <div className="flex items-center rounded-lg border border-gray-300 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">

                <Lock className="h-4 w-4 text-gray-400" />

                <input
                  type="password"
                  value={
                    password.newPassword
                  }
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      newPassword:
                        e.target.value,
                    })
                  }
                  placeholder="Enter new password"
                  className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none"
                />

              </div>

            </div>

            {/* CHANGE PASSWORD */}
            <div className="pt-1">

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </button>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default ProfilePage;