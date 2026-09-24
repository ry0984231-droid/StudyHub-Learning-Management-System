import React, { useState } from "react";
import {
    Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageCircle,
    GraduationCap, Headphones, UserRound, ShieldCheck, ArrowRight
} from "lucide-react";
import { api } from "../services/api.js";

export const ContactPage = () => {
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const response = await api.submitContact(
                Object.fromEntries(new FormData(e.currentTarget).entries())
            );
            if (response.success) setSubmitted(true);
        } catch (err) {
            setError(err.message || "We could not send your message. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const contactInfo = [
        {
            icon: Mail, label: "Email Support", value: "support@studyhub.edu"
        },
        {
            icon: Phone, label: "Student Support", value: "+91 80000 12345"
        },
        {
            icon: MapPin, label: "Location", value: "Lucknow, Uttar Pradesh, India"
        }
    ];

    const supportOptions = [
        {
            icon: GraduationCap, title: "Student Support",
            text: "Get assistance with course enrollment, lessons, progress, quizzes, certificates, and your student account."
        },
        {
            icon: UserRound, title: "Instructor Support",
            text: "Assistance with course creation, lesson management, publishing content, and instructor account features."
        },
        {
            icon: Headphones, title: "Technical Support",
            text: "Having trouble with login, course access, videos, payments, or other platform functionality? Let us know."
        }
    ];

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:bg-slate-800";

    return (
        <div className="min-h-screen bg-white text-gray-900 dark:bg-slate-950 dark:text-white">

            {/* HERO */}
            <section className="border-b border-blue-800 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
                <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100">
                            <MessageCircle className="h-5 w-5" />
                            Contact StudyHub
                        </div>

                        <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
                            Get in Touch with <span className="text-blue-100">StudyHub</span>
                        </h1>

                        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                            Have a question about courses, enrollment, account access,
                            learning progress, certificates, or any technical issue?
                            Send us a message and we will help you with your query.
                        </p>

                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-medium text-white">
                                <GraduationCap className="h-4 w-4 text-blue-100" />
                                Student Support
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-medium text-white">
                                <Headphones className="h-4 w-4 text-indigo-100" />
                                Technical Support
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT */}
            <section className="bg-slate-50 py-16 sm:py-20 dark:bg-slate-950">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">

                        {/* LEFT */}
                        <div className="space-y-5 lg:col-span-5">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    Contact Information
                                </span>
                                <h2 className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl">
                                    We're ready to support your learning journey
                                </h2>
                                <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-slate-400">
                                    Reach out to us for academic assistance, platform
                                    support, course-related questions, or general
                                    information about StudyHub.
                                </p>
                            </div>

                            {contactInfo.map(({ icon: Icon, label, value }) => (
                                <div key={label}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800">
                                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-400/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                                    <div className="relative flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-all duration-300 group-hover:scale-110">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                                                {label}
                                            </span>
                                            <p className="mt-1 text-sm font-bold text-gray-800 dark:text-slate-100">{value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Support Hours</h3>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Monday – Saturday</p>
                                        <p className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                                            9:00 AM – 6:00 PM IST
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FORM */}
                        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-8 lg:col-span-7">
                            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-sky-500/5 blur-3xl" />

                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="relative space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                                            <Send className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl">
                                                Send us a message
                                            </h2>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                                We'll get back to you as soon as possible.
                                            </p>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-slate-300">
                                                Full Name
                                            </label>
                                            <input name="name" type="text" required
                                                placeholder="Enter your name" className={inputClass} />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-slate-300">
                                                Email Address
                                            </label>
                                            <input name="email" type="email" required
                                                placeholder="you@example.com" className={inputClass} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-slate-300">
                                            Inquiry Type
                                        </label>
                                        <select name="inquiryType" required defaultValue="" className={inputClass}>
                                            <option value="" disabled>Select an inquiry type</option>
                                            <option value="course">Course Information</option>
                                            <option value="enrollment">Enrollment & Access</option>
                                            <option value="account">Account Support</option>
                                            <option value="certificate">Certificate Support</option>
                                            <option value="technical">Technical Issue</option>
                                            <option value="instructor">Instructor Support</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-slate-300">
                                            Subject
                                        </label>
                                        <input name="subject" type="text" required
                                            placeholder="How can we help?" className={inputClass} />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-slate-300">
                                            Message
                                        </label>
                                        <textarea name="message" rows={5} required
                                            placeholder="Describe your question or issue..."
                                            className={`${inputClass} resize-none`} />
                                    </div>

                                    <button type="submit" disabled={submitting}
                                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
                                        <Send className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                                        {submitting ? "Sending..." : "Send Message"}
                                    </button>

                                    <p className="text-center text-[10px] text-gray-400 dark:text-slate-500">
                                        We typically respond within one business day.
                                    </p>
                                </form>
                            ) : (
                                <div className="relative flex min-h-[480px] items-center justify-center text-center">
                                    <div className="max-w-sm">
                                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                                            <CheckCircle2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h2 className="mt-6 text-2xl font-extrabold text-gray-900 dark:text-white">
                                            Message Sent Successfully
                                        </h2>
                                        <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                                            Thank you for contacting StudyHub.
                                            Our support team will review your message
                                            and get back to you as soon as possible.
                                        </p>
                                        <button type="button" onClick={() => setSubmitted(false)}
                                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-xs font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-blue-950 dark:text-blue-300">
                                            Send Another Message
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* SUPPORT OPTIONS */}
            <section className="bg-white py-16 sm:py-20 dark:bg-slate-950">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            How We Can Help
                        </span>
                        <h2 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                            Find the right support
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-slate-400">
                            Whether you are a student, instructor, or platform user,
                            we're here to help you get the most out of StudyHub.
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {supportOptions.map(({ icon: Icon, title, text }) => (
                            <div key={title}
                                className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 font-bold text-gray-900 dark:text-white">{title}</h3>
                                <p className="mt-2 text-xs leading-6 text-gray-500 dark:text-slate-400">{text}</p>
                                <div className="mt-5 h-1 w-10 rounded-full bg-blue-500 transition-all duration-300 group-hover:w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST */}
            <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950 sm:p-10">
                        <div className="flex flex-col items-start gap-6 sm:flex-row">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md transition-all duration-300 group-hover:scale-110">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl">
                                    Your Trust Matters to Us
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-slate-400">
                                    StudyHub is committed to providing a dependable
                                    learning environment. We value responsible handling
                                    of account information and aim to maintain secure
                                    and reliable platform experiences for our learners
                                    and instructors.
                                </p>
                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    {[
                                        "Secure account access",
                                        "Responsible data handling",
                                        "Reliable learning experience",
                                        "Dedicated support"
                                    ].map(item => (
                                        <div key={item}
                                            className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-slate-300">
                                            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white pb-16 dark:bg-slate-950">
                <div className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 text-center text-white sm:p-14">
                    <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-125" />
                    <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl transition-transform duration-700 group-hover:scale-125" />

                    <div className="relative mx-auto max-w-2xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                            <GraduationCap className="h-8 w-8 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                        </div>

                        <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">
                            Still Have Questions?
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-blue-100">
                            Our team is here to help you make the most of your StudyHub learning experience.
                        </p>

                        <button type="button"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs font-bold text-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100 active:scale-95">
                            Contact Support
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
