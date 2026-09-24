import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";

import { Navbar } from "./components/Navbar.jsx";
import { Footer } from "./components/Footer.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { TopLoader } from "./components/TopLoader.jsx";

import { HomePage } from "./pages/HomePage.jsx";
import { CoursesPage } from "./pages/CoursesPage.jsx";
import { CourseDetailsPage } from "./pages/CourseDetailsPage.jsx";
import { VideoLearningPage } from "./pages/VideoLearningPage.jsx";
import { QuizPage } from "./pages/QuizPage.jsx";
import { CheckoutPaymentPage } from "./pages/CheckoutPaymentPage.jsx";
import { VerifyCertificatePage } from "./pages/VerifyCertificatePage.jsx";

import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage.jsx";

import { StudentDashboard } from "./pages/StudentDashboard.jsx";
import { InstructorDashboard } from "./pages/InstructorDashboard.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";

import { AboutPage } from "./pages/AboutPage.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import PaymentHistoryPage from "./pages/PaymentHistoryPage.jsx";
import CertificatesPage from "./pages/CertificatesPage.jsx";

import CreateCoursePage from "./pages/CreateCoursePage.jsx";
import ManageLessonsPage from "./pages/ManageLessonsPage.jsx";
import AddLessonPage from "./pages/AddLessonPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const getViewFromPath = () => {
    const { pathname: path, search } = window.location;
    const q = new URLSearchParams(search);

    if (path === "/" || !path) return { name: "home", params: {} };

    if (path === "/courses")
        return {
            name: "courses",
            params: {
                search: q.get("search") || "",
                category: q.get("category") || "All",
            },
        };

    if (path.startsWith("/instructor/add-lesson/")) {
        const courseId = path.slice("/instructor/add-lesson/".length);
        const lessonId = q.get("lessonId");
        return {
            name: lessonId ? "instructor-edit-lesson" : "instructor-add-lesson",
            params: { courseId, lessonId: lessonId || "" },
        };
    }

    const routes = [
        ["/course/", "course-details", "courseId"],
        ["/course-details/", "course-details", "courseId"],
        ["/learn/", "learn", "courseId"],
        ["/quiz/", "quiz", "quizId"],
        ["/checkout/", "checkout", "courseId"],
        ["/verify-certificate/", "verify-certificate", "certificateId"],
        ["/instructor/manage-lessons/", "instructor-manage-lessons", "courseId"],
    ];

    for (const [prefix, name, key] of routes) {
        if (path.startsWith(prefix))
            return { name, params: { [key]: path.slice(prefix.length) } };
    }

    const exact = {
        "/login": "login",
        "/register": "register",
        "/forgot-password": "forgot-password",
        "/about": "about",
        "/contact": "contact",
        "/settings": "settings",
        "/profile": "profile",
        "/notifications": "notifications",
        "/dashboard": "student-dashboard",
        "/student/dashboard": "student-dashboard",
        "/student/courses": "student-my-courses",
        "/student/wishlist": "student-wishlist",
        "/student/certificates": "student-certificates",
        "/student/payments": "student-payments",
        "/certificates": "student-certificates-page",
        "/instructor/dashboard": "instructor-dashboard",
        "/instructor/courses": "instructor-courses",
        "/instructor/create-course": "instructor-create-course-page",
        "/admin": "admin-dashboard",
        "/admin/dashboard": "admin-dashboard",
        "/admin/users": "admin-users",
        "/admin/courses": "admin-courses",
        "/admin/payments": "admin-payments",
    };

    return exact[path]
        ? { name: exact[path], params: {} }
        : { name: "not-found", params: {} };
};

const getUrlFromView = (view, p = {}) => {
    const routes = {
        home: "/",
        login: "/login",
        register: "/register",
        "forgot-password": "/forgot-password",
        about: "/about",
        contact: "/contact",
        settings: "/settings",
        profile: "/profile",
        notifications: "/notifications",

        "student-dashboard": "/student/dashboard",
        "student-my-courses": "/student/courses",
        "student-wishlist": "/student/wishlist",
        "student-certificates": "/student/certificates",
        "student-payments": "/student/payments",
        "student-certificates-page": "/certificates",

        "instructor-dashboard": "/instructor/dashboard",
        "instructor-courses": "/instructor/courses",
        "instructor-create-course": "/instructor/create-course",
        "instructor-create-course-page": "/instructor/create-course",

        "admin-dashboard": "/admin/dashboard",
        "admin-users": "/admin/users",
        "admin-courses": "/admin/courses",
        "admin-payments": "/admin/payments",
    };

    if (view === "courses") {
        const q = new URLSearchParams();
        if (p.search?.trim()) q.set("search", p.search.trim());
        if (p.category && p.category !== "All") q.set("category", p.category);
        return `/courses${q.toString() ? `?${q}` : ""}`;
    }

    const dynamic = {
        "course-details": p.courseId ? `/course/${p.courseId}` : "/courses",
        learn: p.courseId ? `/learn/${p.courseId}` : "/courses",
        quiz: p.quizId ? `/quiz/${p.quizId}` : "/dashboard",
        checkout: p.courseId ? `/checkout/${p.courseId}` : "/courses",
        "verify-certificate": p.certificateId
            ? `/verify-certificate/${p.certificateId}`
            : "/",
        "instructor-manage-lessons": p.courseId
            ? `/instructor/manage-lessons/${p.courseId}`
            : "/instructor/courses",
        "instructor-add-lesson": p.courseId
            ? `/instructor/add-lesson/${p.courseId}`
            : "/instructor/courses",
        "instructor-edit-lesson": p.courseId
            ? `/instructor/add-lesson/${p.courseId}?lessonId=${p.lessonId || ""}`
            : "/instructor/courses",
    };

    return dynamic[view] || routes[view] || "/";
};

const MainAppContent = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [viewState, setViewState] = useState(getViewFromPath);
    const [isNavigating, setIsNavigating] = useState(false);
    const timer = useRef(null);

    const setCurrentView = (name, params = {}) => {
        setIsNavigating(true);
        setViewState({ name, params });

        const url = getUrlFromView(name, params);
        if (window.location.pathname + window.location.search !== url)
            window.history.pushState({}, "", url);

        window.scrollTo({ top: 0, behavior: "smooth" });

        clearTimeout(timer.current);
        timer.current = setTimeout(() => setIsNavigating(false), 350);
    };

    useEffect(() => {
        const pop = () => {
            setIsNavigating(true);
            setViewState(getViewFromPath());
            window.scrollTo({ top: 0, behavior: "smooth" });
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setIsNavigating(false), 350);
        };

        window.addEventListener("popstate", pop);
        return () => {
            window.removeEventListener("popstate", pop);
            clearTimeout(timer.current);
        };
    }, []);

    const { name: view, params = {} } = viewState;
    const classroom = view === "learn";
    const dashboard =
        view.startsWith("student-") ||
        view.startsWith("instructor-") ||
        view.startsWith("admin-") ||
        view === "settings";

    const requiresAuth = dashboard || [
        "profile",
        "notifications",
        "student-payments",
        "student-certificates-page",
        "learn",
        "quiz",
        "checkout",
    ].includes(view);

    const roleAllowed =
        (!view.startsWith("admin-") || user?.role === "admin") &&
        (!view.startsWith("instructor-") ||
            ["instructor", "admin"].includes(user?.role));

    const renderContent = () => {
        const common = { setCurrentView };

        if (requiresAuth && isLoading)
            return (
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
            );

        if (requiresAuth && !isAuthenticated)
            return <LoginPage {...common} />;

        if (!roleAllowed)
            return <NotFoundPage {...common} />;

        switch (view) {
            case "home":
                return <HomePage {...common} />;

            case "courses":
                return (
                    <CoursesPage
                        initialSearch={params.search || ""}
                        initialCategory={params.category || "All"}
                        {...common}
                    />
                );

            case "course-details":
                return <CourseDetailsPage courseId={params.courseId || ""} {...common} />;

            case "learn":
                return (
                    <VideoLearningPage
                        courseId={params.courseId || ""}
                        initialLessonId={params.initialLessonId}
                        {...common}
                    />
                );

            case "quiz":
                return <QuizPage quizId={params.quizId || ""} {...common} />;

            case "checkout":
                return <CheckoutPaymentPage courseId={params.courseId || ""} {...common} />;

            case "verify-certificate":
                return (
                    <VerifyCertificatePage
                        initialCertId={params.certificateId || ""}
                        {...common}
                    />
                );

            case "login":
                return <LoginPage {...common} />;

            case "register":
                return <RegisterPage {...common} />;

            case "forgot-password":
                return <ForgotPasswordPage {...common} />;

            case "student-dashboard":
            case "student-my-courses":
            case "student-wishlist":
            case "student-certificates":
                return <StudentDashboard currentTab={view} {...common} />;

            case "instructor-dashboard":
            case "instructor-courses":
            case "instructor-create-course":
            case "instructor-students":
            case "instructor-quizzes":
            case "instructor-analytics":
                return <InstructorDashboard {...common} />;

            case "admin-dashboard":
            case "admin-users":
            case "admin-courses":
            case "admin-payments":
                return <AdminDashboard {...common} />;

            case "about":
                return <AboutPage {...common} />;

            case "contact":
                return <ContactPage />;

            case "settings":
                return <SettingsPage />;

            case "profile":
                return <ProfilePage {...common} />;

            case "notifications":
                return <NotificationsPage {...common} />;

            case "student-payments":
                return <PaymentHistoryPage />;

            case "student-certificates-page":
                return <CertificatesPage {...common} />;

            case "instructor-create-course-page":
                return <CreateCoursePage {...common} />;

            case "instructor-manage-lessons":
                return <ManageLessonsPage courseId={params.courseId || ""} {...common} />;

            case "instructor-add-lesson":
            case "instructor-edit-lesson":
                return (
                    <AddLessonPage
                        courseId={params.courseId || ""}
                        lessonId={params.lessonId || ""}
                        {...common}
                    />
                );

            default:
                return <NotFoundPage {...common} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
            <TopLoader loading={isNavigating} />

            {!classroom && (
                <Navbar currentView={view} setCurrentView={setCurrentView} />
            )}

            <div className="flex-1 flex flex-col">
                {dashboard && isAuthenticated ? (
                    <div className="flex-1 flex flex-col lg:flex-row">
                        <Sidebar
                            currentView={view}
                            setCurrentView={setCurrentView}
                            role={user?.role || "student"}
                        />
                        <main className="flex-1 min-w-0 bg-white dark:bg-slate-950">
                            {renderContent()}
                        </main>
                    </div>
                ) : (
                    <main className="flex-1 min-w-0 bg-white dark:bg-slate-950">
                        {renderContent()}
                    </main>
                )}
            </div>

            {!classroom && <Footer setCurrentView={setCurrentView} />}
        </div>
    );
};

const App = () => <MainAppContent />;

export default App;
