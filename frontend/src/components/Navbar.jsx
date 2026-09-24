import React, { useEffect, useRef, useState } from "react";
import {
    GraduationCap, Menu, X, Bell, User as UserIcon, BookOpen, Award,
    Settings, LogOut, LayoutDashboard, Heart, CreditCard, Sparkles,
    Sun, Moon, Users, BarChart3
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { api } from "../services/api.js";

export const Navbar = ({ currentView, setCurrentView }) => {
    const {
        user, isAuthenticated, role, logout,
        unreadNotifications, refreshNotifications
    } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [mobile, setMobile] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const [notifMenu, setNotifMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const userRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const close = e => {
            if (!userRef.current?.contains(e.target)) setUserMenu(false);
            if (!notifRef.current?.contains(e.target)) setNotifMenu(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const navigate = (view, params) => {
        setCurrentView(view, params);
        setMobile(false);
        setUserMenu(false);
        setNotifMenu(false);
    };

    const dashboard = () =>
        role === "student"
            ? "student-dashboard"
            : role === "admin"
                ? "admin-dashboard"
                : "instructor-dashboard";

    const loadNotifications = async () => {
        if (notifMenu) return setNotifMenu(false);

        setNotifMenu(true);
        setLoading(true);

        try {
            const res = await api.getNotifications();
            setNotifications(res?.success ? res.data || [] : []);
        } catch (err) {
            console.error("Notification error:", err);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications(list => list.map(n => ({ ...n, read: true })));
            await refreshNotifications();
        } catch (err) {
            console.error("Mark read error:", err);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout error:", err);
        }
        navigate("home");
    };

    const links = [
        ["Home", "home"],
        ["Courses", "courses"],
        ["About", "about"],
        ["Contact", "contact"]
    ];

    const accountLinks = role === "admin"
        ? [
            ["Admin Dashboard", "admin-dashboard", LayoutDashboard],
            ["Manage Users", "admin-users", Users],
            ["Manage Courses", "admin-courses", BookOpen],
            ["Payment History", "admin-payments", CreditCard],
        ]
        : role === "instructor"
            ? [
                ["Instructor Dashboard", "instructor-dashboard", LayoutDashboard],
                ["Manage Courses", "instructor-courses", BookOpen],
                ["Create Course", "instructor-create-course-page", GraduationCap],
                ["Students Progress", "instructor-students", Users],
                ["Analytics", "instructor-analytics", BarChart3],
            ]
            : [
                ["Student Dashboard", "student-dashboard", LayoutDashboard],
                ["My Courses", "student-my-courses", BookOpen],
                ["Wishlist", "student-wishlist", Heart],
                ["Certificates", "student-certificates", Award],
                ["Payment History", "student-payments", CreditCard],
            ];

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex h-16 items-center justify-between gap-3">

                    {/* Logo */}
                    <button
                        onClick={() => navigate("home")}
                        className="flex shrink-0 items-center gap-2"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
                            <GraduationCap size={20} className="text-white" />
                        </span>

                        <div className="text-left">
                            <div className="text-lg font-bold">
                                Study<span className="text-blue-600">Hub</span>
                            </div>
                            <p className="hidden text-[8px] uppercase text-gray-400 sm:block">
                                Learning Management System
                            </p>
                        </div>
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-1 md:flex">
                                {links.map(([label, view]) => (
                                    <NavButton
                                        key={view}
                                        label={label}
                                        active={currentView === view || (view === "courses" && ["course-details", "checkout"].includes(currentView))}
                                onClick={() => navigate(view)}
                            />
                        ))}
                    </nav>

                    {/* Right */}
                    <div className="flex items-center gap-1">

                        {/* Notifications */}
                        {isAuthenticated && (
                            <div ref={notifRef} className="relative">
                                <button
                                    onClick={loadNotifications}
                                    className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
                                >
                                    <Bell size={18} />

                                    {unreadNotifications > 0 && (
                                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                                            {unreadNotifications > 9 ? "9+" : unreadNotifications}
                                        </span>
                                    )}
                                </button>

                                {notifMenu && (
                                    <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

                                        <div className="flex justify-between border-b border-gray-200 p-4 dark:border-slate-700">
                                            <div>
                                                <h3 className="text-sm font-bold">Notifications</h3>
                                                <p className="text-[10px] text-gray-400">
                                                    Your latest updates
                                                </p>
                                            </div>

                                            {unreadNotifications > 0 && (
                                                <button
                                                    onClick={markAllRead}
                                                    className="text-[11px] font-semibold text-blue-600"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-80 overflow-y-auto">
                                            {loading ? (
                                                <div className="p-8 text-center text-sm text-gray-400">
                                                    Loading...
                                                </div>
                                            ) : notifications.length ? (
                                                notifications.slice(0, 8).map(item => (
                                                    <div
                                                        key={item._id}
                                                        className={`flex gap-3 border-b border-gray-100 p-3 dark:border-slate-800 ${!item.read
                                                                ? "bg-blue-50 dark:bg-blue-950/30"
                                                                : ""
                                                            }`}
                                                    >
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950">
                                                            {item.type === "certificate_generated" ? (
                                                                <Award size={16} />
                                                            ) : item.type === "payment_confirmation" ? (
                                                                <CreditCard size={16} />
                                                            ) : (
                                                                <Sparkles size={16} />
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold">
                                                                {item.title}
                                                            </p>
                                                            <p className="mt-1 text-[10px] text-gray-500">
                                                                {item.message}
                                                            </p>
                                                        </div>

                                                        {!item.read && (
                                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <Bell className="mx-auto text-gray-400" />
                                                    <p className="mt-2 text-sm font-semibold">
                                                        No notifications
                                                    </p>
                                                    <p className="text-[11px] text-gray-400">
                                                        You're all caught up.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => navigate(dashboard())}
                                            className="w-full border-t border-gray-200 py-3 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                        >
                                            Open Dashboard →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User */}
                        {isAuthenticated && user ? (
                            <div ref={userRef} className="relative">
                                <button
                                    onClick={() => setUserMenu(v => !v)}
                                    className="flex items-center gap-2 rounded-xl p-1 hover:bg-gray-100 dark:hover:bg-slate-800"
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name || "User"}
                                            className="h-8 w-8 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                                            <UserIcon size={16} className="text-blue-600" />
                                        </div>
                                    )}

                                    <div className="hidden text-left sm:block">
                                        <p className="max-w-24 truncate text-xs font-semibold">
                                            {user.name}
                                        </p>
                                        <p className="text-[8px] uppercase text-gray-400">
                                            {user.role}
                                        </p>
                                    </div>
                                </button>

                                {userMenu && (
                                    <div className="absolute right-0 top-11 z-50 w-60 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">

                                        <div className="mb-1 border-b border-gray-200 px-3 py-3 dark:border-slate-700">
                                            <p className="truncate text-sm font-semibold">{user.name}</p>
                                            <p className="truncate text-[11px] text-gray-500">{user.email}</p>
                                        </div>

                                        {accountLinks.map(([label, view, Icon]) => (
                                            <MenuItem
                                                key={view}
                                                icon={<Icon />}
                                                label={label}
                                                onClick={() => navigate(view)}
                                            />
                                        ))}

                                        <div className="my-1 border-t border-gray-200 dark:border-slate-700" />

                                        <MenuItem icon={<UserIcon />} label="My Profile"
                                            onClick={() => navigate("profile")} />
                                        <MenuItem icon={<Bell />} label="Notifications"
                                            onClick={() => navigate("notifications")} />
                                        <MenuItem icon={<Settings />} label="Settings"
                                            onClick={() => navigate("settings")} />
                                        <MenuItem icon={<LogOut />} label="Sign Out"
                                            danger onClick={handleLogout} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden items-center gap-1 sm:flex">
                                <button
                                    onClick={() => navigate("login")}
                                    className="px-3 py-2 text-sm font-semibold hover:text-blue-600"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate("register")}
                                    className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    Register
                                </button>
                            </div>
                        )}

                        {/* Theme */}
                        <button
                            onClick={toggleTheme}
                            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${theme === "light"
                                ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 hover:border-amber-300"
                                : "border-indigo-400/30 bg-gradient-to-br from-slate-800 to-indigo-950 text-indigo-300 hover:border-indigo-300/50"
                                }`}
                        >
                            {theme === "light" ? (
                                <Sun size={19} className="fill-amber-400/20" />
                            ) : (
                                <Moon size={18} className="fill-indigo-300/20" />
                            )}
                        </button>

                        {/* Mobile Button */}
                        <button
                            onClick={() => setMobile(v => !v)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden"
                        >
                            {mobile ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobile && (
                    <div className="border-t border-gray-200 py-3 dark:border-slate-700 md:hidden">
                        {links.map(([label, view]) => (
                            <MobileNavItem
                                key={view}
                                label={label}
                                active={currentView === view || (view === "courses" && ["course-details", "checkout"].includes(currentView))}
                                onClick={() => navigate(view)}
                            />
                        ))}

                        {!isAuthenticated ? (
                            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-200 pt-3 dark:border-slate-700">
                                <button
                                    onClick={() => navigate("login")}
                                    className="rounded-xl bg-gray-100 py-2.5 text-sm font-semibold dark:bg-slate-800"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate("register")}
                                    className="rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white"
                                >
                                    Register
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-slate-700">
                                <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    {role || "Account"} links
                                </p>
                                {accountLinks.map(([label, view, Icon]) => (
                                    <MobileNavItem
                                        key={view}
                                        label={label}
                                        icon={Icon}
                                        active={currentView === view}
                                        onClick={() => navigate(view)}
                                    />
                                ))}
                                <div className="my-2 border-t border-gray-100 dark:border-slate-800" />
                                <MobileNavItem label="My Profile" icon={UserIcon} active={currentView === "profile"} onClick={() => navigate("profile")} />
                                <MobileNavItem label="Notifications" icon={Bell} active={currentView === "notifications"} onClick={() => navigate("notifications")} />
                                <MobileNavItem label="Settings" icon={Settings} active={currentView === "settings"} onClick={() => navigate("settings")} />
                                <button
                                    onClick={handleLogout}
                                    className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                    <LogOut size={16} />Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

const NavButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`rounded-xl px-3 py-2 text-sm font-semibold ${active
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50"
                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
    >
        {label}
    </button>
);

const MenuItem = ({ icon, label, onClick, danger }) => (
    <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${danger
                ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
    >
        {React.cloneElement(icon, { size: 16 })}
        {label}
    </button>
);

const MobileNavItem = ({ label, active, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold ${active
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50"
                : "text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
    >
        {Icon && <Icon size={16} />}
        {label}
    </button>
);

export default Navbar;
