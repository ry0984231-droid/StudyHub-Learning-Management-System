import React, { useEffect } from "react";
import { X } from "lucide-react";

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "lg",
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "4xl": "max-w-4xl",
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            {/* Background */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className={`
          relative w-full ${maxWidthClasses[maxWidth]}
          max-h-[90vh]
          overflow-hidden
          rounded-2xl
          bg-white dark:bg-slate-900
          shadow-xl
        `}
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-200 dark:border-slate-700">
                        <h2
                            id="modal-title"
                            className="text-lg font-bold text-gray-900 dark:text-white truncate"
                        >
                            {title}
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close modal"
                            className="
                w-9 h-9
                flex items-center justify-center
                rounded-lg
                text-gray-500
                hover:bg-gray-100
                dark:hover:bg-slate-800
                hover:text-gray-900
                dark:hover:text-white
              "
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="max-h-[calc(90vh-73px)] overflow-y-auto">
                    <div className="p-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;



