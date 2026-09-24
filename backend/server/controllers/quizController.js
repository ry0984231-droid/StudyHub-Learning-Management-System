import { db } from "../db/store.js";

const canManageCourse = (user, course) => !!course && (
    user?.role === "admin" ||
    (user?.role === "instructor" && course.instructorId === user._id)
);

const isEnrolled = (user, courseId) => db.enrollments.some(
    enrollment => enrollment.userId === user?._id && enrollment.courseId === courseId
);

const getQuizzes = async (req, res) => {
    try {
        const { courseId } = req.query;
        let quizzes = db.quizzes.filter(quiz => {
            const course = db.courses.find(c => c._id === quiz.courseId);
            return canManageCourse(req.user, course) ||
                (course?.status === "published" && isEnrolled(req.user, quiz.courseId));
        });

        if (courseId)
            quizzes = quizzes.filter(q => q.courseId === courseId);

        const data = quizzes.map(({ questions, ...quiz }) => ({
            ...quiz,
            questions: questions.map(
                ({ correctAnswers, explanation, ...question }) => question
            )
        }));

        res.json({ success: true, count: data.length, data });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error fetching quizzes."
        });
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = db.quizzes.find(q => q._id === req.params.id);

        if (!quiz)
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });

        const course = db.courses.find(c => c._id === quiz.courseId);
        if (!course)
            return res.status(404).json({ success: false, message: "Course not found." });

        const canManage = canManageCourse(req.user, course);
        if (course.status !== "published" && !canManage)
            return res.status(404).json({ success: false, message: "Quiz not found." });
        if (!canManage && !isEnrolled(req.user, course._id))
            return res.status(403).json({ success: false, message: "Enroll in this course to access its quiz." });

        const canViewAnswers = canManage;

        const questions = quiz.questions.map(q => {
            if (canViewAnswers) return q;
            const { correctAnswers, explanation, ...safeQuestion } = q;
            return safeQuestion;
        });

        res.json({
            success: true,
            data: { ...quiz, questions }
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error retrieving quiz."
        });
    }
};

const submitQuiz = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });

        const quiz = db.quizzes.find(q => q._id === req.params.id);

        if (!quiz)
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });

        const course = db.courses.find(c => c._id === quiz.courseId);
        const canManage = canManageCourse(req.user, course);
        if (!course || (course.status !== "published" && !canManage))
            return res.status(404).json({ success: false, message: "Quiz not found." });
        if (!canManage && !isEnrolled(req.user, quiz.courseId))
            return res.status(403).json({ success: false, message: "You must be enrolled in this course to take the quiz." });

        const { answers = [], timeSpentSeconds } = req.body;

        if (!Array.isArray(answers) || answers.some(answer =>
            !answer || typeof answer.questionId !== "string" ||
            !Array.isArray(answer.selectedOptions) ||
            answer.selectedOptions.some(option => !Number.isInteger(option) || option < 0)
        ))
            return res.status(400).json({ success: false, message: "Quiz answers are invalid." });

        const validQuestionIds = new Set(quiz.questions.map(question => question.id));
        if (answers.some(answer => !validQuestionIds.has(answer.questionId) ||
            answer.selectedOptions.some(option => option >= (quiz.questions.find(q => q.id === answer.questionId)?.options?.length || 0))))
            return res.status(400).json({ success: false, message: "Quiz answers contain invalid questions or options." });

        let totalMarks = 0,
            earnedMarks = 0,
            correctCount = 0,
            wrongCount = 0;

        const questionResults = quiz.questions.map(q => {
            totalMarks += q.marks;

            const submission = answers.find(
                a => a.questionId === q.id
            );

            const selected = submission?.selectedOptions || [];
            const selectedSorted = [...selected].sort((a, b) => a - b);
            const correctSorted = [...q.correctAnswers].sort(
                (a, b) => a - b
            );

            const isCorrect =
                selectedSorted.length === correctSorted.length &&
                selectedSorted.every(
                    (value, index) => value === correctSorted[index]
                );

            if (isCorrect) {
                earnedMarks += q.marks;
                correctCount++;
            } else {
                wrongCount++;
            }

            return {
                questionId: q.id,
                question: q.question,
                type: q.type,
                options: q.options,
                selectedOptions: selected,
                correctAnswers: q.correctAnswers,
                isCorrect,
                marksEarned: isCorrect ? q.marks : 0,
                totalMarks: q.marks,
                explanation: q.explanation
            };
        });

        const percentage = totalMarks
            ? Math.round((earnedMarks / totalMarks) * 100)
            : 0;

        const passed = percentage >= quiz.passPercentage;

        const attempt = {
            _id: `att_${Date.now()}`,
            userId: req.user._id,
            userName: req.user.name,
            quizId: quiz._id,
            quizTitle: quiz.title,
            courseId: quiz.courseId,
            answers,
            score: earnedMarks,
            totalMarks,
            percentage,
            passed,
            timeSpentSeconds: Number(timeSpentSeconds) || 60,
            completedAt: new Date().toISOString()
        };

        db.quizAttempts.push(attempt);

        if (passed && quiz.lessonId) {
            const enrollment = db.enrollments.find(
                e =>
                    e.userId === req.user._id &&
                    e.courseId === quiz.courseId
            );

            if (
                enrollment &&
                !enrollment.completedLessons.includes(quiz.lessonId)
            ) {
                enrollment.completedLessons.push(quiz.lessonId);

                const totalLessons =
                    db.lessons.filter(
                        l => l.courseId === quiz.courseId
                    ).length || 1;

                enrollment.progressPercentage = Math.min(
                    100,
                    Math.round(
                        (enrollment.completedLessons.length /
                            totalLessons) *
                        100
                    )
                );
            }
        }

        await db.save();

        res.json({
            success: true,
            message: passed
                ? "Congratulations! You passed the quiz!"
                : "Quiz submitted. Review your answers below.",
            result: {
                attemptId: attempt._id,
                score: earnedMarks,
                totalMarks,
                percentage,
                passed,
                passPercentage: quiz.passPercentage,
                correctCount,
                wrongCount,
                timeSpentSeconds: attempt.timeSpentSeconds,
                questions: questionResults
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error processing quiz submission."
        });
    }
};

const getQuizResults = async (req, res) => {
    try {
        const quiz = db.quizzes.find(q => q._id === req.params.id);
        if (!quiz)
            return res.status(404).json({ success: false, message: "Quiz not found." });

        const course = db.courses.find(c => c._id === quiz.courseId);
        const canManage = canManageCourse(req.user, course);
        if (!canManage && !isEnrolled(req.user, quiz.courseId))
            return res.status(403).json({ success: false, message: "You are not authorized to view these quiz results." });

        let attempts = db.quizAttempts.filter(
            a => a.quizId === req.params.id
        );

        if (!canManage)
            attempts = attempts.filter(
                a => a.userId === req.user._id
            );

        res.json({
            success: true,
            count: attempts.length,
            data: attempts
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error fetching quiz attempts."
        });
    }
};

const createQuiz = async (req, res) => {
    try {
        const {
            courseId,
            lessonId,
            title,
            description,
            timeLimitMinutes,
            passPercentage,
            questions
        } = req.body;

        if (!courseId || !title || !Array.isArray(questions))
            return res.status(400).json({
                success: false,
                message:
                    "Course ID, title, and questions array required."
            });

        const course = db.courses.find(
            c => c._id === courseId
        );

        if (!course)
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });

        if (
            req.user?.role === "instructor" &&
            course.instructorId !== req.user._id
        )
            return res.status(403).json({
                success: false,
                message:
                    "You can only create quizzes for your own courses."
            });

        const newQuiz = {
            _id: `quiz_${Date.now()}`,
            courseId,
            courseTitle: course.title,
            lessonId: lessonId || undefined,
            title,
            description: description || "",
            timeLimitMinutes: Number(timeLimitMinutes) || 15,
            passPercentage: Number(passPercentage) || 75,
            questions: questions.map((q, index) => ({
                id: q.id || `q_${Date.now()}_${index}`,
                question: q.question,
                type: q.type || "mcq",
                options: q.options || [],
                correctAnswers: q.correctAnswers || [0],
                marks: Number(q.marks) || 10,
                explanation: q.explanation || ""
            })),
            createdAt: new Date().toISOString()
        };

        db.quizzes.push(newQuiz);
        await db.save();

        res.status(201).json({
            success: true,
            message: "Quiz created successfully!",
            data: newQuiz
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error creating quiz."
        });
    }
};

const updateQuiz = async (req, res) => {
    try {
        const quiz = db.quizzes.find(
            q => q._id === req.params.id
        );

        if (!quiz)
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });

        const course = db.courses.find(
            c => c._id === quiz.courseId
        );

        if (
            !course ||
            (req.user?.role === "instructor" &&
                course.instructorId !== req.user._id)
        )
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to update this quiz."
            });

        const allowed = [
            "lessonId",
            "title",
            "description",
            "timeLimitMinutes",
            "passPercentage",
            "questions"
        ];

        allowed.forEach(field => {
            if (req.body[field] !== undefined)
                quiz[field] = req.body[field];
        });

        await db.save();

        res.json({
            success: true,
            message: "Quiz updated successfully.",
            data: quiz
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error updating quiz."
        });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const index = db.quizzes.findIndex(
            q => q._id === req.params.id
        );

        if (index === -1)
            return res.status(404).json({
                success: false,
                message: "Quiz not found."
            });

        const quiz = db.quizzes[index];
        const course = db.courses.find(
            c => c._id === quiz.courseId
        );

        if (
            !course ||
            (req.user?.role === "instructor" &&
                course.instructorId !== req.user._id)
        )
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to delete this quiz."
            });

        db.quizzes.splice(index, 1);
        await db.save();

        res.json({
            success: true,
            message: "Quiz deleted successfully."
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Error deleting quiz."
        });
    }
};

export {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    createQuiz,
    updateQuiz,
    deleteQuiz
};
