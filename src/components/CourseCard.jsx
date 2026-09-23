import React, { useState } from "react";
import { Clock, BookOpen, Users, Heart, ArrowRight } from "lucide-react";
import { Rating } from "./Rating.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";

const CourseCard = ({ course, onSelect, isWishlistedInitial = false }) => {
    const { isAuthenticated, user, updateUser } = useAuth();
    const [wishlisted, setWishlisted] = useState(
        user?.wishlist?.includes(course._id) ?? isWishlistedInitial
    );
    const [loading, setLoading] = useState(false);
    const [imageFailed, setImageFailed] = useState(!course.thumbnail);

    const toggleWishlist = async e => {
        e.stopPropagation();

        if (!isAuthenticated) {
            alert("Please sign in to add courses to your wishlist.");
            return;
        }

        try {
            setLoading(true);
            const res = await api.toggleWishlist(course._id);

            if (res.success) {
                setWishlisted(res.isWishlisted);
                if (user) updateUser({ wishlist: res.wishlist });
            }
        } catch (err) {
            console.error("Wishlist error:", err);
        } finally {
            setLoading(false);
        }
    };

    const openCourse = () => onSelect?.(course._id);
    const price = course.discountPrice ?? course.price ?? 0;
    const lessons = course.lessonsCount ?? 0;
    const students = course.studentsCount ?? 0;
    const rating = course.rating || 0;

    return (
        <article
            onClick={openCourse}
            className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
            {/* Image */}
            <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 via-sky-50 to-blue-200 dark:from-blue-950 dark:via-slate-800 dark:to-slate-700">
                {imageFailed ? (
                    <div className="absolute inset-0 flex items-center justify-center text-blue-600/50 dark:text-blue-300/50">
                        <BookOpen className="h-12 w-12" />
                    </div>
                ) : (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={() => setImageFailed(true)}
                    />
                )}

                {course.category && (
                    <span className="absolute left-3 top-3 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                        {course.category}
                    </span>
                )}

                <button
                    onClick={toggleWishlist}
                    disabled={loading}
                    title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow dark:bg-slate-900 ${wishlisted ? "text-red-500" : "text-gray-600 hover:text-red-500 dark:text-slate-300"
                        }`}
                >
                    <Heart size={17} fill={wishlisted ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">

                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Rating rating={rating} size="sm" showScore />
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                            ({course.ratingCount || 0})
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Users size={14} />
                        {students.toLocaleString()}
                    </div>
                </div>

                    <h3 className="min-h-12 line-clamp-2 text-base font-bold text-slate-900 dark:text-white">
                    {course.title}
                </h3>

                <p className="mt-2 min-h-10 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {course.description || "Explore the course and start learning at your own pace."}
                </p>

                {/* Instructor */}
                <div className="mt-auto flex items-center gap-2 pt-4">
                    {course.instructorAvatar ? (
                        <img
                            src={course.instructorAvatar}
                            alt={course.instructorName || "Instructor"}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                            {(course.instructorName || "I").charAt(0)}
                        </div>
                    )}

                    <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Instructor</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {course.instructorName || "StudyHub Instructor"}
                        </p>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-4 flex items-center gap-4 border-y border-slate-100 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-600" />
                        {course.duration || "Self-paced"}
                    </span>

                    <span className="flex items-center gap-1">
                        <BookOpen size={14} className="text-blue-600" />
                        {lessons} lessons
                    </span>
                </div>

                {/* Bottom */}
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                            ₹{price.toLocaleString()}
                        </span>

                        {course.discountPrice && course.discountPrice < course.price && (
                            <span className="ml-2 text-xs text-slate-400 line-through dark:text-slate-500">
                                ₹{course.price.toLocaleString()}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={e => {
                            e.stopPropagation();
                            openCourse();
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                        View Course
                        <ArrowRight size={14} />
                    </button>
                </div>

            </div>
        </article>
    );
};

export { CourseCard };
export default CourseCard;
