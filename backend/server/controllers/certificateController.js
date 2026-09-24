import { db } from "../db/store.js";

const auth = (req, res) => {
    if (req.user) return true;
    res.status(401).json({ success: false, message: "Not authenticated" });
    return false;
};

const passedAssessments = (userId, courseId) => {
    const quizzes = db.quizzes.filter(q => q.courseId === courseId);
    return !quizzes.length || quizzes.every(q =>
        db.quizAttempts.some(
            a => a.userId === userId && a.quizId === q._id && a.passed
        )
    );
};

const createCertificate = (user, course) => {
    const code = (course.category || "COURSE")
        .replace(/[^a-z0-9]/gi, "")
        .slice(0, 3)
        .toUpperCase()
        .padEnd(3, "X");

    const certificateId =
        `SH-${new Date().getFullYear()}-${code}-${Date.now().toString(36).toUpperCase()}`;

    return {
        _id: `cert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        certificateId,
        userId: user._id,
        studentName: user.name,
        studentEmail: user.email,
        courseId: course._id,
        courseTitle: course.title,
        instructorName: course.instructorName,
        issueDate: new Date().toISOString().split("T")[0],
        verificationCode:
            `VER-${Math.random().toString(36).slice(2, 10).toUpperCase()}-${certificateId}`,
        grade: "Course Completed",
    };
};

export async function getMyCertificates(req, res) {
    try {
        if (!auth(req, res)) return;

        const data = db.certificates.filter(c => c.userId === req.user._id);

        res.json({ success: true, count: data.length, data });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error fetching certificates.",
        });
    }
}

export async function getCertificateById(req, res) {
    try {
        const { id } = req.params;
        const cert = db.certificates.find(
            c =>
                c._id === id ||
                c.certificateId.toLowerCase() === id.toLowerCase()
        );

        if (!cert)
            return res.status(404).json({
                success: false,
                message: "Certificate not found.",
            });

        if (
            req.user &&
            req.user.role !== "admin" &&
            cert.userId !== req.user._id
        )
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this certificate.",
            });

        res.json({ success: true, data: cert });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error retrieving certificate.",
        });
    }
}

export async function verifyCertificate(req, res) {
    try {
        const id = String(req.params.certificateId || "").trim();

        if (!id)
            return res.status(400).json({
                success: false,
                verified: false,
                message: "Certificate identifier is required.",
            });

        const cert = db.certificates.find(c =>
            [c.certificateId, c.verificationCode, c._id]
                .some(v => v?.toLowerCase() === id.toLowerCase())
        );

        if (!cert)
            return res.status(404).json({
                success: false,
                verified: false,
                message: "No authentic StudyHub certificate found with that identifier.",
            });

        res.json({
            success: true,
            verified: true,
            data: {
                certificateId: cert.certificateId,
                studentName: cert.studentName,
                courseTitle: cert.courseTitle,
                instructorName: cert.instructorName,
                issueDate: cert.issueDate,
                grade: cert.grade,
                verificationCode: cert.verificationCode,
                issuer: "StudyHub Learning Management System",
            },
        });
    } catch {
        res.status(500).json({
            success: false,
            verified: false,
            message: "Error verifying certificate.",
        });
    }
}

export async function generateCertificate(req, res) {
    try {
        if (!auth(req, res)) return;

        const { courseId } = req.body;

        if (!courseId)
            return res.status(400).json({
                success: false,
                message: "Course ID is required.",
            });

        const course = db.courses.find(c => c._id === courseId);
        if (!course)
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });

        const enrollment = db.enrollments.find(
            e => e.userId === req.user._id && e.courseId === courseId
        );

        if (!enrollment)
            return res.status(403).json({
                success: false,
                message: "You must be enrolled in this course.",
            });

        if (Number(enrollment.progressPercentage || 0) < 100)
            return res.status(400).json({
                success: false,
                message:
                    "Complete 100% of the course lessons before generating your certificate.",
            });

        if (!passedAssessments(req.user._id, courseId))
            return res.status(400).json({
                success: false,
                message:
                    "Pass all required course assessments before generating your certificate.",
            });

        const existing = db.certificates.find(
            c => c.userId === req.user._id && c.courseId === courseId
        );

        if (existing)
            return res.json({
                success: true,
                message: "Certificate already exists.",
                data: existing,
            });

        const certificate = createCertificate(req.user, course);

        db.certificates.push(certificate);
        db.notifications.push({
            _id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId: req.user._id,
            type: "certificate_generated",
            title: "Certificate Generated",
            message: `Your certificate for "${course.title}" is ready.`,
            link: "/student-certificates",
            read: false,
            createdAt: new Date().toISOString(),
        });

        await db.save();

        res.status(201).json({
            success: true,
            message: "Certificate generated successfully!",
            data: certificate,
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error generating certificate.",
        });
    }
}

export { passedAssessments as getPassedRequiredAssessments, createCertificate };