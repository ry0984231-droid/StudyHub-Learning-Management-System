import React from "react";
import {
    LayoutDashboard,
    BookOpen,
    Award,
    Heart,
    CreditCard,
    Settings,
    LogOut,
    Users,
    PlusCircle,
    BarChart3,
    GraduationCap,
    ChevronRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

export const Sidebar = ({
    currentView,
    setCurrentView,
    role,
}) => {
    const { user, logout } = useAuth();

    // =========================================================
    // STUDENT LINKS
    // =========================================================

    const studentLinks = [
        {
            id: "student-dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            id: "student-my-courses",
            label: "My Courses",
            icon: BookOpen,
        },
        {
            id: "student-wishlist",
            label: "Wishlist",
            icon: Heart,
        },
        {
            id: "student-certificates",
            label: "Certificates",
            icon: Award,
        },
        {
            id: "student-payments",
            label: "Payment History",
            icon: CreditCard,
        },
        {
            id: "settings",
            label: "Account Settings",
            icon: Settings,
        },
    ];

    // =========================================================
    // INSTRUCTOR LINKS
    // =========================================================

    const instructorLinks = [
        {
            id: "instructor-dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            id: "instructor-courses",
            label: "Manage Courses",
            icon: BookOpen,
        },
        {
            id: "instructor-create-course",
            label: "Create Course",
            icon: PlusCircle,
        },
        {
            id: "instructor-students",
            label: "Students Progress",
            icon: Users,
        },
        {
            id: "instructor-analytics",
            label: "Analytics & Revenue",
            icon: BarChart3,
        },
        {
            id: "settings",
            label: "Settings",
            icon: Settings,
        },
    ];

    // =========================================================
    // ADMIN LINKS
    // =========================================================

    const adminLinks = [
        {
            id: "admin-dashboard",
            label: "Overview Metrics",
            icon: LayoutDashboard,
        },
        {
            id: "admin-users",
            label: "Manage Users",
            icon: Users,
        },
        {
            id: "admin-courses",
            label: "All Courses",
            icon: BookOpen,
        },
        {
            id: "admin-payments",
            label: "Transactions",
            icon: CreditCard,
        },
        {
            id: "settings",
            label: "Settings",
            icon: Settings,
        },
    ];

    // =========================================================
    // SELECT LINKS BASED ON ROLE
    // =========================================================

    const links =
        role === "admin"
            ? adminLinks
            : role === "instructor"
                ? instructorLinks
                : studentLinks;

    // =========================================================
    // ROLE LABEL
    // =========================================================

    const portalLabel =
        role === "admin"
            ? "Administration"
            : role === "instructor"
                ? "Instructor Portal"
                : "Student Portal";

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        logout();
        setCurrentView("home");
    };

    // =========================================================
    // SIDEBAR
    // =========================================================

    return (
        <aside
            className="
                hidden lg:flex
                sticky top-16
                z-30
                h-[calc(100vh-4rem)]
                w-64
                shrink-0
                flex-col
                overflow-y-auto
                border-r border-gray-200
                bg-white
                p-4
                dark:border-slate-800
                dark:bg-slate-950
            "
        >
            {/* =====================================================
                USER PROFILE
            ===================================================== */}

            <div
                className="
                    mb-6
                    rounded-2xl
                    border border-gray-100
                    bg-gradient-to-br from-blue-50 to-indigo-50
                    p-3
                    shadow-sm
                    dark:border-slate-800
                    dark:from-slate-900
                    dark:to-slate-900
                "
            >
                <div className="flex items-center gap-3">

                    {/* Avatar */}
                    <div className="relative shrink-0">

                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name || "User"}
                                className="
                                    h-11
                                    w-11
                                    rounded-xl
                                    object-cover
                                    ring-2
                                    ring-white
                                    dark:ring-slate-800
                                "
                            />
                        ) : (
                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-600
                                    text-sm
                                    font-extrabold
                                    text-white
                                    shadow-sm
                                "
                            >
                                {user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                            </div>
                        )}

                        {/* Online indicator */}
                        <span
                            className="
                                absolute
                                -bottom-0.5
                                -right-0.5
                                h-3
                                w-3
                                rounded-full
                                border-2
                                border-white
                                bg-emerald-500
                                dark:border-slate-900
                            "
                        />
                    </div>

                    {/* User Details */}
                    <div className="min-w-0 flex-1">

                        <h4
                            className="
                                truncate
                                text-xs
                                font-extrabold
                                text-gray-900
                                dark:text-white
                            "
                        >
                            {user?.name || "User"}
                        </h4>

                        <p
                            className="
                                mt-0.5
                                truncate
                                text-[10px]
                                text-gray-400
                                dark:text-gray-500
                            "
                        >
                            {user?.email || "Account"}
                        </p>

                        <span
                            className="
                                mt-1.5
                                inline-flex
                                items-center
                                rounded-full
                                bg-blue-100
                                px-2
                                py-0.5
                                text-[8px]
                                font-extrabold
                                uppercase
                                tracking-wider
                                text-blue-700
                                dark:bg-blue-950
                                dark:text-blue-300
                            "
                        >
                            {role}
                        </span>

                    </div>
                </div>
            </div>

            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <div className="flex-1">

                {/* Section Heading */}
                <div className="mb-3 px-2">

                    <p
                        className="
                            text-[10px]
                            font-extrabold
                            uppercase
                            tracking-[0.12em]
                            text-gray-400
                            dark:text-gray-500
                        "
                    >
                        {portalLabel}
                    </p>

                </div>

                {/* Links */}
                <nav className="space-y-1.5">

                    {links.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                    setCurrentView(item.id)
                                }
                                className={`
                                    group
                                    relative
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3
                                    py-3
                                    text-left
                                    text-sm
                                    font-semibold
                                    transition-all
                                    duration-200

                                    ${isActive
                                        ? `
                                                bg-blue-600
                                                text-white
                                                shadow-md
                                                shadow-blue-600/20
                                            `
                                        : `
                                                text-gray-600
                                                hover:bg-blue-50
                                                hover:text-blue-600
                                                dark:text-gray-400
                                                dark:hover:bg-slate-900
                                                dark:hover:text-blue-400
                                            `
                                    }
                                `}
                            >

                                {/* Active indicator */}
                                {isActive && (
                                    <span
                                        className="
                                            absolute
                                            left-0
                                            top-1/2
                                            h-6
                                            w-1
                                            -translate-y-1/2
                                            rounded-r-full
                                            bg-white
                                        "
                                    />
                                )}

                                {/* Icon */}
                                <span
                                    className={`
                                        flex
                                        h-8
                                        w-8
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        transition-all

                                        ${isActive
                                            ? "bg-white/15"
                                            : "bg-gray-50 group-hover:bg-white dark:bg-slate-800 dark:group-hover:bg-slate-700"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={17}
                                        strokeWidth={2}
                                        className={
                                            isActive
                                                ? "text-white"
                                                : "text-gray-400 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400"
                                        }
                                    />
                                </span>

                                {/* Label */}
                                <span className="flex-1 truncate">
                                    {item.label}
                                </span>

                                {/* Arrow */}
                                <ChevronRight
                                    size={14}
                                    className={`
                                        shrink-0
                                        transition-all
                                        duration-200

                                        ${isActive
                                            ? "translate-x-0 text-white/80"
                                            : "-translate-x-1 text-gray-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-blue-500"
                                        }
                                    `}
                                />

                            </button>
                        );
                    })}

                </nav>
            </div>

            {/* =====================================================
                BOTTOM ACTIONS
            ===================================================== */}

            <div
                className="
                    mt-5
                    space-y-2
                    border-t
                    border-gray-100
                    pt-4
                    dark:border-slate-800
                "
            >

                {/* Explore Courses */}
                <button
                    type="button"
                    onClick={() => setCurrentView("courses")}
                    className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-blue-100
                        bg-blue-50
                        px-3
                        py-3
                        text-left
                        text-xs
                        font-extrabold
                        text-blue-700
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:border-blue-200
                        hover:bg-blue-100
                        dark:border-blue-950
                        dark:bg-blue-950/40
                        dark:text-blue-300
                        dark:hover:bg-blue-950
                    "
                >
                    <span
                        className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-white
                            text-blue-600
                            shadow-sm
                            dark:bg-slate-900
                            dark:text-blue-400
                        "
                    >
                        <GraduationCap size={16} />
                    </span>

                    <span className="flex-1">
                        Explore Course Catalog
                    </span>

                    <ChevronRight
                        size={14}
                        className="
                            text-blue-400
                            transition-transform
                            group-hover:translate-x-0.5
                        "
                    />
                </button>

                {/* Logout */}
                <button
                    type="button"
                    onClick={handleLogout}
                    className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-left
                        text-sm
                        font-semibold
                        text-red-600
                        transition-all
                        duration-200
                        hover:bg-red-50
                        dark:text-red-400
                        dark:hover:bg-red-950/30
                    "
                >
                    <span
                        className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-red-50
                            text-red-500
                            transition
                            group-hover:bg-red-100
                            dark:bg-red-950/30
                            dark:text-red-400
                            dark:group-hover:bg-red-950/50
                        "
                    >
                        <LogOut size={16} />
                    </span>

                    <span>
                        Log Out
                    </span>
                </button>

            </div>
        </aside>
    );
};

export default Sidebar;