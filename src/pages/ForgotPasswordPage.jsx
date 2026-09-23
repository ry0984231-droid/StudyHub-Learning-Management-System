import React, { useEffect, useState } from "react";
import {
    KeyRound, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2,
    AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck
} from "lucide-react";
import { api } from "../services/api.js";

export const ForgotPasswordPage = ({ setCurrentView }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (step !== 2 || countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [step, countdown]);

    const handleRequestCode = async e => {
        e.preventDefault();
        setError("");
        setInfoMessage("");
        const mail = email.trim();

        if (!mail) return setError("Please enter your registered email address.");
        setLoading(true);

        try {
            const res = await api.forgotPassword(mail);
            if (res.success) {
                setInfoMessage(
                    res.message || "A verification code has been sent to your registered email address."
                );
                setStep(2);
                setCountdown(60);
                setCanResend(false);
            } else {
                setError(res.message || "Unable to send the verification code.");
            }
        } catch (err) {
            setError(err?.message || "Unable to send the verification code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend || loading) return;
        setError("");
        setInfoMessage("");
        setLoading(true);

        try {
            const res = await api.forgotPassword(email.trim());
            if (res.success) {
                setInfoMessage("A new verification code has been sent to your registered email address.");
                setCountdown(60);
                setCanResend(false);
                setOtp("");
            } else {
                setError(res.message || "Unable to resend the verification code.");
            }
        } catch (err) {
            setError(err?.message || "Unable to resend the verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async e => {
        e.preventDefault();
        setError("");
        setInfoMessage("");

        if (otp.length !== 6)
            return setError("Please enter the valid 6-digit verification code.");
        if (newPassword.length < 8)
            return setError("Password must contain at least 8 characters.");
        if (newPassword !== confirmPassword)
            return setError("The passwords do not match.");

        setLoading(true);

        try {
            const res = await api.resetPassword({
                email: email.trim(),
                otp: otp.trim(),
                newPassword,
                confirmPassword
            });

            if (res.success) setStep(3);
            else setError(res.message || "Unable to update your password.");
        } catch (err) {
            setError(err?.message || "Password reset failed. Please check your verification code.");
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (!newPassword) return { score: 0, label: "", color: "bg-gray-200" };

        let score = 0;
        if (newPassword.length >= 6) score++;
        if (newPassword.length >= 10) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;

        if (score <= 2) return { score: 1, label: "Weak", color: "bg-rose-500" };
        if (score <= 4) return { score: 2, label: "Good", color: "bg-amber-500" };
        return { score: 3, label: "Strong", color: "bg-emerald-500" };
    };

    const strength = getPasswordStrength();

    const inputClass =
        "w-full py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition";

    const passwordInput = (confirm = false) => (
        <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type={confirm
                    ? showConfirmPassword ? "text" : "password"
                    : showPassword ? "text" : "password"}
                required
                value={confirm ? confirmPassword : newPassword}
                onChange={e =>
                    confirm ? setConfirmPassword(e.target.value) : setNewPassword(e.target.value)
                }
                placeholder={confirm ? "Re-enter your new password" : "Create a new password"}
                className={`${inputClass} pl-11 pr-11`}
            />
            <button
                type="button"
                onClick={() =>
                    confirm
                        ? setShowConfirmPassword(!showConfirmPassword)
                        : setShowPassword(!showPassword)
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
                {(confirm ? showConfirmPassword : showPassword)
                    ? <EyeOff className="w-5 h-5" />
                    : <Eye className="w-5 h-5" />}
            </button>
        </div>
    );

    return (
        <div className="min-h-[85vh] bg-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                <button
                    type="button"
                    onClick={() => setCurrentView("login")}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>

                <div className="text-center mb-7">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                        {step === 3
                            ? <CheckCircle2 className="w-7 h-7" />
                            : <KeyRound className="w-7 h-7" />}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {step === 1 && "Forgot Password?"}
                        {step === 2 && "Verify Your Account"}
                        {step === 3 && "Password Reset Complete"}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {step === 1 &&
                            "Enter your registered email address to receive a verification code."}
                        {step === 2 &&
                            `Enter the verification code sent to ${email} and create a new password.`}
                        {step === 3 &&
                            "Your password has been successfully updated. You can now sign in to your StudyHub account."}
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/60 p-6 sm:p-8">

                    {error && (
                        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm leading-5">{error}</p>
                        </div>
                    )}

                    {infoMessage && step === 2 && (
                        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm leading-5">{infoMessage}</p>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleRequestCode} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Registered Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className={`${inputClass} pl-11 pr-4`}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-xs leading-5 text-gray-500">
                                        For security, the verification code will be sent to the email address
                                        associated with your StudyHub account.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? "Sending Verification Code..." : "Send Verification Code"}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Verification Code
                                    </label>
                                    <button
                                        type="button"
                                        disabled={!canResend || loading}
                                        onClick={handleResendCode}
                                        className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1.5"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        {canResend ? "Resend Code" : `Resend in ${countdown}s`}
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    required
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="Enter 6-digit code"
                                    className={`${inputClass} text-center font-mono text-xl font-bold tracking-[0.35em]`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    New Password
                                </label>

                                {passwordInput()}

                                {newPassword && (
                                    <div className="mt-2.5">
                                        <div className="flex gap-1.5 h-1.5">
                                            {[1, 2, 3].map(item => (
                                                <div
                                                    key={item}
                                                    className={`flex-1 rounded-full ${strength.score >= item ? strength.color : "bg-gray-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-[11px] text-gray-400">
                                                Use letters, numbers and symbols for a stronger password.
                                            </span>
                                            <span className="text-[11px] font-semibold text-gray-500 ml-2">
                                                {strength.label}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                {passwordInput(true)}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? "Updating Password..." : "Reset Password"}
                                {!loading && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center py-5">
                            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                                <CheckCircle2 className="w-9 h-9" />
                            </div>

                            <h2 className="text-lg font-bold text-gray-900">Password Updated</h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Your password has been successfully changed. You can now sign in
                                using your new password.
                            </p>

                            <button
                                type="button"
                                onClick={() => setCurrentView("login")}
                                className="mt-6 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                Continue to Sign In <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    StudyHub Learning Management System
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;