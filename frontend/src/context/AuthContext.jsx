import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "studyhub_token";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [isLoading, setIsLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const refreshNotifications = useCallback(async () => {
        if (!localStorage.getItem(TOKEN_KEY)) {
            setUnreadNotifications(0);
            return;
        }

        try {
            const res = await api.getNotifications();
            if (res?.success) setUnreadNotifications(res.unreadCount || 0);
        } catch (err) {
            console.error("Notification error:", err);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        const savedToken = localStorage.getItem(TOKEN_KEY);

        if (!savedToken) {
            setUser(null);
            setToken(null);
            setIsLoading(false);
            return;
        }

        try {
            const res = await api.getMe();

            if (res?.success && res.user) {
                setUser(res.user);
                setToken(savedToken);
                await refreshNotifications();
            } else {
                localStorage.removeItem(TOKEN_KEY);
                setUser(null);
                setToken(null);
            }
        } catch (err) {
            console.error("Authentication error:", err);
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    }, [refreshNotifications]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const authenticate = async (request, errorMessage) => {
        try {
            const res = await request();

            if (res?.success && res.token && res.user) {
                localStorage.setItem(TOKEN_KEY, res.token);
                setToken(res.token);
                setUser(res.user);
                await refreshNotifications();
            }

            return res;
        } catch (err) {
            console.error(errorMessage, err);
            return { success: false, message: err?.message || errorMessage };
        }
    };

    const login = (email, password) =>
        authenticate(
            () => api.login({ email, password }),
            "Unable to login. Please try again."
        );

    const register = (name, email, password, role = "student") =>
        authenticate(
            () =>
                api.register({
                    name,
                    email,
                    password,
                    confirmPassword: password,
                    role,
                }),
            "Unable to create account. Please try again."
        );

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setUnreadNotifications(0);
    };

    const updateUser = data =>
        setUser(current => (current ? { ...current, ...data } : current));

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        role: user?.role || null,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        unreadNotifications,
        refreshNotifications,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};

export default AuthContext;
