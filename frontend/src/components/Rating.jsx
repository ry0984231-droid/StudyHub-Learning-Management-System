import React from "react";
import { Star } from "lucide-react";

export const Rating = ({
    rating,
    max = 5,
    size = "sm",
    interactive = false,
    onRatingChange,
    showScore = false,
}) => {
    const sizes = {
        sm: "w-3.5 h-3.5",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    const handleClick = value => {
        if (interactive && onRatingChange) onRatingChange(value);
    };

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center">
                {Array.from({ length: max }, (_, i) => {
                    const value = i + 1;
                    const filled = rating >= value;
                    const half = !filled && rating >= value - 0.5;

                    return (
                        <button
                            key={i}
                            type={interactive ? "button" : undefined}
                            disabled={!interactive}
                            onClick={() => handleClick(value)}
                            className={
                                interactive
                                    ? "cursor-pointer transition-transform hover:scale-110"
                                    : "cursor-default"
                            }
                        >
                            <Star
                                className={`${sizes[size] || sizes.sm} ${filled
                                        ? "fill-amber-400 text-amber-400"
                                        : half
                                            ? "fill-amber-400/50 text-amber-400"
                                            : "text-slate-300 dark:text-slate-600"
                                    }`}
                            />
                        </button>
                    );
                })}
            </div>

            {showScore && (
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {Number(rating || 0).toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default Rating;