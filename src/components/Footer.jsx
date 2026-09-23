import React from "react";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export const Footer = ({ setCurrentView }) => {
    const year = new Date().getFullYear();

    const links = [
        ["Home", "home"],
        ["Courses", "courses"],
        ["Quizzes", "student-my-courses"],
        ["About", "about"],
        ["Contact", "contact"]
    ];

    const contact = [
        [Mail, "support@studyhub.com"],
        [Phone, "Online Student Support"],
        [MapPin, "Online Learning Platform"]
    ];
    return (
        <footer className="border-t border-blue-100 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="grid gap-10 md:grid-cols-3">
                    <div>
                        <button
                            onClick={() => setCurrentView("home")}
                            className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/40">
                                <GraduationCap className="text-white" size={22} />
                            </span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                Study<span className="text-blue-600 dark:text-blue-400">Hub</span>
                            </span>
                        </button>
                        <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                            StudyHub is a Learning Management System for students and
                            instructors to learn, manage courses and track learning progress.
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Quick Links</h3>

                        <div className="flex flex-col gap-3 text-sm">
                            {links.map(([label, view]) => (
                                <button
                                    key={view}
                                    onClick={() => setCurrentView(view)}
                                    className="w-fit rounded-sm text-left transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-blue-300 dark:focus-visible:ring-blue-400"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Contact</h3>

                        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                            {contact.map(([Icon, text]) => (
                                <div key={text} className="flex items-center gap-3">
                                    <Icon size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-10 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        © {year} StudyHub LMS. All rights reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
