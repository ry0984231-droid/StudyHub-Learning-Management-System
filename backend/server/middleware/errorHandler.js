const notFound = (req, res) =>
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} was not found.`
    });

const errorHandler = (error, _req, res, _next) => {
    console.error(error);

    const message =
        error instanceof Error
            ? error.message
            : "An unexpected server error occurred.";

    res.status(500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "An unexpected server error occurred."
                : message
    });
};

export { notFound, errorHandler };