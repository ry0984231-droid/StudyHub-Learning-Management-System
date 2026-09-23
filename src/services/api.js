const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");
const TOKEN_KEY = "studyhub_token";

const getAuthHeaders = formData => ({
    ...(formData ? {} : { "Content-Type": "application/json" }),
    ...(localStorage.getItem(TOKEN_KEY)
        ? { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
        : {}),
});

const request = async (endpoint, options = {}) => {
    const formData = options.body instanceof FormData;

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: { ...getAuthHeaders(formData), ...(options.headers || {}) },
    });

    const type = res.headers.get("content-type") || "";
    const data = type.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

    if (!res.ok) {
        const error = new Error(data.message || "An error occurred during network request.");
        error.status = res.status;
        error.data = data;
        throw error;
    }

    return data;
};

const json = (method, body) => ({
    method,
    body: JSON.stringify(body),
});

export const api = {
    // Auth
    register: body => request("/auth/register", json("POST", body)),
    login: body => request("/auth/login", json("POST", body)),
    getHomeOverview: () => request("/home/overview"),
    getMe: () => request("/auth/me"),
    forgotPassword: email =>
        request("/auth/forgot-password", json("POST", { email })),
    verifyOtp: (email, otp) =>
        request("/auth/verify-otp", json("POST", { email, otp })),
    resetPassword: body => request("/auth/reset-password", json("POST", body)),
    updateProfile: body => request("/auth/profile", json("PUT", body)),
    changePassword: body => request("/auth/change-password", json("PUT", body)),

    // Courses
    getCourses: params => {
        const query = params ? `?${new URLSearchParams(params)}` : "";
        return request(`/courses${query}`);
    },
    getCategories: () => request("/courses/categories"),
    getCourse: id => request(`/courses/${id}`),
    getInstructorCourses: () => request("/instructor/courses"),
    createCourse: body => request("/courses", json("POST", body)),
    updateCourse: (id, body) => request(`/courses/${id}`, json("PUT", body)),
    deleteCourse: id => request(`/courses/${id}`, { method: "DELETE" }),

    // Lessons
    getLessons: courseId => request(`/lessons/course/${courseId}`),
    getLesson: id => request(`/lessons/${id}`),
    createLesson: body => request("/lessons", { method: "POST", body }),
    updateLesson: (id, body) =>
        request(`/lessons/${id}`, json("PUT", body)),
    deleteLesson: id => request(`/lessons/${id}`, { method: "DELETE" }),

    // Enrollments
    getMyEnrollments: () => request("/enrollments/mine"),
    checkEnrollment: courseId => request(`/enrollments/check/${courseId}`),
    enrollCourse: courseId =>
        request("/enrollments/enroll", json("POST", { courseId })),
    completeLesson: (courseId, lessonId) =>
        request(
            "/enrollments/complete-lesson",
            json("POST", { courseId, lessonId })
        ),
    getMyLearningActivity: () => request("/enrollments/activity"),

    // Quizzes
    getQuizzes: courseId =>
        request(`/quizzes${courseId ? `?courseId=${encodeURIComponent(courseId)}` : ""}`),
    getQuiz: id => request(`/quizzes/${id}`),
    submitQuiz: (id, body) => request(`/quizzes/${id}/submit`, json("POST", body)),
    createQuiz: body => request("/quizzes", json("POST", body)),
    deleteQuiz: id => request(`/quizzes/${id}`, { method: "DELETE" }),

    // Payments
    createPaymentOrder: courseId =>
        request("/payments/create-order", json("POST", { courseId })),
    verifyPayment: body => request("/payments/verify", json("POST", body)),
    processPayment: body => request("/payments/verify", json("POST", body)),
    getPaymentHistory: () => request("/payments/history"),
    getAdminPayments: () => request("/admin/payments"),

    // Certificates
    getMyCertificates: () => request("/certificates/my"),
    getCertificate: id => request(`/certificates/${id}`),
    verifyCertificate: id => request(`/certificates/verify/${id}`),
    generateCertificate: courseId =>
        request("/certificates/generate", json("POST", { courseId })),

    // Reviews
    getCourseReviews: courseId => request(`/reviews/course/${courseId}`),
    addReview: body => request("/reviews", json("POST", body)),

    // Wishlist
    getWishlist: () => request("/wishlist"),
    toggleWishlist: courseId =>
        request(`/wishlist/toggle/${courseId}`, { method: "POST" }),

    // Notifications
    getNotifications: () => request("/notifications"),
    markNotificationRead: id =>
        request(`/notifications/${id}/read`, { method: "PUT" }),
    markAllNotificationsRead: () =>
        request("/notifications/read-all", { method: "PUT" }),

    // Instructor
    getInstructorStats: () => request("/instructor/stats"),
    getInstructorStudents: () => request("/instructor/students"),

    // Admin
    getAdminMetrics: () => request("/admin/metrics"),
    getAdminStats: () => request("/admin/metrics"),
    getAdminUsers: () => request("/admin/users"),
    updateUserRole: (id, role) =>
        request(`/admin/users/${id}/role`, json("PUT", { role })),
    deleteUser: id => request(`/admin/users/${id}`, { method: "DELETE" }),

    // Contact
    submitContact: body => request("/contact", json("POST", body)),
};

export default api;
