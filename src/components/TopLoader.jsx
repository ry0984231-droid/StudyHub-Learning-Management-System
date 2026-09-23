import React, { useEffect, useRef, useState } from "react";

export const TopLoader = ({ loading }) => {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timer = useRef(null);

    useEffect(() => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }

        if (loading) {
            setVisible(true);
            setProgress(12);

            const frame = requestAnimationFrame(() => setProgress(78));
            return () => cancelAnimationFrame(frame);
        }

        if (!visible) return;

        setProgress(100);
        timer.current = setTimeout(() => {
            setVisible(false);
            setProgress(0);
            timer.current = null;
        }, 250);

        return () => {
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
            }
        };
    }, [loading, visible]);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-x-0 top-0 z-[100] h-1 pointer-events-none"
            role="progressbar"
            aria-label="Loading page"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(progress)}
        >
            <div
                className="h-full bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.85)] transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default TopLoader;