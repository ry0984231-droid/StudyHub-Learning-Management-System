import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(
    process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads", "videos")
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .toLowerCase();
        cb(
            null,
            `${Date.now()}-${safeName}${ext}`
        );
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only MP4, WebM, MOV and AVI video files are allowed."
            ),
            false
        );
    }
};

export const uploadVideo = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024,
    },
});

export const videoUploadDir = uploadDir;
