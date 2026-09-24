import React from "react";

export const ProgressBar = ({
    progress,
    showText = true,
    size = "md",
    color = "indigo",
}) => {
    const value = Math.max(0, Math.min(100, Math.round(progress)));

    const heights = {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-3.5",
    };

    const colors = {
        indigo: "from-indigo-600 to-purple-600",
        emerald: "from-emerald-500 to-teal-500",
        amber: "from-amber-500 to-orange-500",
        purple: "from-purple-600 to-pink-600",
    };

    return (
        <div className="w-full">
            <div
                className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${heights[size] || heights.md}`}
            >
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors[color] || colors.indigo
                        } transition-all duration-500 ease-out`}
                    style={{ width: `${value}%` }}
                />
            </div>

            {showText && (
                <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>{value}% Completed</span>
                    {value === 100 && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            100% Ready for Certificate
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProgressBar;