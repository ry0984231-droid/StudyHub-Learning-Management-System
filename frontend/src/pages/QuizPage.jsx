import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Award,
    BookOpen,
    Check,
    CheckCircle2,
    Clock3,
    HelpCircle,
    RotateCcw,
} from "lucide-react";
import { api } from "../services/api.js";

const formatTime = seconds => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export const QuizPage = ({ quizId, setCurrentView }) => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
    const submitLock = useRef(false);

    useEffect(() => {
        let active = true;

        const loadQuiz = async () => {
            setLoading(true);
            setLoadError("");
            setQuiz(null);
            setResult(null);
            setAnswers({});
            setCurrentQuestionIndex(0);
            setIsSubmitted(false);
            setConfirmSubmitModal(false);
            setTimeLeftSeconds(0);
            submitLock.current = false;

            if (!quizId) {
                setLoadError("Quiz not found.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.getQuiz(quizId);
                const data = response?.data;
                if (!response?.success || !Array.isArray(data?.questions) || !data.questions.length)
                    throw new Error("This quiz has no questions available yet.");

                if (!active) return;
                setQuiz(data);
                setTimeLeftSeconds(Math.max(1, Number(data.timeLimitMinutes) || 10) * 60);
            } catch (error) {
                if (active) setLoadError(error?.message || "Unable to load this quiz.");
            } finally {
                if (active) setLoading(false);
            }
        };

        loadQuiz();
        return () => { active = false; };
    }, [quizId]);

    const handleSubmitQuiz = useCallback(async () => {
        if (!quiz || submitLock.current || isSubmitted) return;

        submitLock.current = true;
        setSubmitting(true);
        setSubmitError("");
        setConfirmSubmitModal(false);

        try {
            const formattedAnswers = Object.entries(answers).map(
                ([questionId, selectedOptions]) => ({ questionId, selectedOptions })
            );
            const timeLimit = Math.max(1, Number(quiz.timeLimitMinutes) || 10) * 60;
            const elapsed = Math.min(timeLimit, Math.max(0, timeLimit - timeLeftSeconds));
            const response = await api.submitQuiz(quiz._id, {
                answers: formattedAnswers,
                timeSpentSeconds: Math.max(15, elapsed),
            });

            if (!response?.success || !response.result)
                throw new Error(response?.message || "Quiz submission failed.");

            setResult(response.result);
            setIsSubmitted(true);
        } catch (error) {
            setSubmitError(error?.message || "Quiz submission failed. Please try again.");
            submitLock.current = false;
        } finally {
            setSubmitting(false);
        }
    }, [answers, isSubmitted, quiz, timeLeftSeconds]);

    useEffect(() => {
        if (loading || !quiz || isSubmitted || submitting || timeLeftSeconds <= 0) return;
        const timer = window.setInterval(() => {
            setTimeLeftSeconds(seconds => Math.max(0, seconds - 1));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [loading, quiz, isSubmitted, submitting]);

    useEffect(() => {
        if (quiz && timeLeftSeconds === 0 && !isSubmitted && !loading)
            handleSubmitQuiz();
    }, [handleSubmitQuiz, isSubmitted, loading, quiz, timeLeftSeconds]);

    if (loading) return <LoadingState />;

    if (!quiz) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <AlertCircle className="mx-auto h-10 w-10 text-blue-600" />
                    <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Quiz unavailable</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{loadError || "This quiz could not be loaded."}</p>
                    <button onClick={() => setCurrentView("student-dashboard")} className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                        Back to dashboard
                    </button>
                </div>
            </div>
        );
    }

    const questions = quiz.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const answeredCount = Object.values(answers).filter(selected => selected?.length > 0).length;
    const progress = Math.round((answeredCount / totalQuestions) * 100);
    const selectedOptions = answers[currentQuestion.id] || [];

    const selectOption = optionIndex => {
        setAnswers(previous => {
            const selected = previous[currentQuestion.id] || [];
            const next = currentQuestion.type === "multiple_answer"
                ? selected.includes(optionIndex)
                    ? selected.filter(index => index !== optionIndex)
                    : [...selected, optionIndex]
                : [optionIndex];
            return { ...previous, [currentQuestion.id]: next };
        });
    };

    const retakeQuiz = () => {
        submitLock.current = false;
        setIsSubmitted(false);
        setResult(null);
        setSubmitError("");
        setAnswers({});
        setCurrentQuestionIndex(0);
        setTimeLeftSeconds(Math.max(1, Number(quiz.timeLimitMinutes) || 10) * 60);
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:py-10">
            <div className="mx-auto max-w-4xl">
                <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{quiz.courseTitle || "StudyHub"}</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight">{quiz.title}</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Assessment quiz</p>
                    </div>
                    {!isSubmitted && (
                        <div role="timer" aria-label={`Time remaining ${formatTime(timeLeftSeconds)}`} className={`inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2 font-mono text-sm font-semibold ${timeLeftSeconds <= 60 ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300" : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"}`}>
                            <Clock3 className="h-4 w-4" />{formatTime(timeLeftSeconds)}
                        </div>
                    )}
                </header>

                {isSubmitted && result ? (
                    <ResultView
                        result={result}
                        quiz={quiz}
                        onRetake={retakeQuiz}
                        onReturn={() => setCurrentView("learn", { courseId: quiz.courseId })}
                        onCertificates={() => setCurrentView("student-certificates")}
                    />
                ) : (
                    <section className="mt-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                <p className="font-semibold">Question {currentQuestionIndex + 1} <span className="font-normal text-slate-500">of {totalQuestions}</span></p>
                                <p className="text-slate-500 dark:text-slate-400">{answeredCount} answered</p>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-label={`${progress}% answered`}>
                                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2" aria-label="Question navigation">
                                {questions.map((question, index) => {
                                    const current = index === currentQuestionIndex;
                                    const answered = (answers[question.id] || []).length > 0;
                                    return (
                                        <button key={question.id || index} type="button" aria-label={`Go to question ${index + 1}`} aria-current={current ? "step" : undefined} onClick={() => setCurrentQuestionIndex(index)} className={`h-9 min-w-9 rounded-lg px-2 text-xs font-semibold transition ${current ? "bg-blue-600 text-white" : answered ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                                    {currentQuestion.type === "true_false" ? "True or False" : currentQuestion.type === "multiple_answer" ? "Choose all that apply" : "Multiple choice"}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{currentQuestion.marks || 0} points</span>
                            </div>
                            <h2 className="mt-5 text-lg font-semibold leading-7 sm:text-xl">{currentQuestion.question}</h2>
                            <div className="mt-6 space-y-3">
                                {(currentQuestion.options || []).map((option, optionIndex) => {
                                    const selected = selectedOptions.includes(optionIndex);
                                    return (
                                        <button key={optionIndex} type="button" aria-pressed={selected} onClick={() => selectOption(optionIndex)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition ${selected ? "border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500 dark:bg-blue-500/10 dark:text-blue-100" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"}`}>
                                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                                                {selected ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + optionIndex)}
                                            </span>
                                            <span className="flex-1">{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {submitError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{submitError}</p>}
                            <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                                <button type="button" disabled={currentQuestionIndex === 0 || submitting} onClick={() => setCurrentQuestionIndex(index => Math.max(0, index - 1))} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                                    <ArrowLeft className="h-4 w-4" />Previous
                                </button>
                                {currentQuestionIndex < totalQuestions - 1 ? (
                                    <button type="button" disabled={submitting} onClick={() => setCurrentQuestionIndex(index => Math.min(totalQuestions - 1, index + 1))} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                                        Next<ArrowRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button type="button" disabled={submitting} onClick={() => setConfirmSubmitModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                                        Review and submit<CheckCircle2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {confirmSubmitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setConfirmSubmitModal(false); }}>
                        <div role="dialog" aria-modal="true" aria-labelledby="submit-quiz-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><HelpCircle className="h-5 w-5" /></div>
                            <h2 id="submit-quiz-title" className="mt-4 text-lg font-semibold">Submit this quiz?</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">You answered {answeredCount} of {totalQuestions} questions. You can still go back and change your answers.</p>
                            {submitError && <p role="alert" className="mt-3 text-sm text-red-600">{submitError}</p>}
                            <div className="mt-6 flex gap-3">
                                <button type="button" disabled={submitting} onClick={() => setConfirmSubmitModal(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800">Keep working</button>
                                <button type="button" disabled={submitting} onClick={handleSubmitQuiz} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{submitting ? "Submitting..." : "Submit quiz"}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ResultView = ({ result, quiz, onRetake, onReturn, onCertificates }) => (
    <div className="mt-6 space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex flex-col items-center text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${result.passed ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                    {result.passed ? <Award className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{result.passed ? "Quiz passed" : "Quiz complete"}</p>
                <h2 className="mt-1 text-4xl font-bold tracking-tight">{result.percentage}%</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{result.score} of {result.totalMarks} marks · Pass mark {result.passPercentage}%</p>
            </div>
            <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                <ResultMetric label="Correct" value={result.correctCount} />
                <ResultMetric label="Incorrect" value={result.wrongCount} />
                <ResultMetric label="Time" value={formatTime(result.timeSpentSeconds)} />
                <ResultMetric label="Status" value={result.passed ? "Passed" : "Retry"} />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={onRetake} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><RotateCcw className="h-4 w-4" />Retake quiz</button>
                {result.passed && <button type="button" onClick={onCertificates} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Award className="h-4 w-4" />View certificates</button>}
                <button type="button" onClick={onReturn} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><BookOpen className="h-4 w-4" />Return to course</button>
            </div>
        </section>

        <section>
            <h3 className="mb-3 text-lg font-semibold">Answer review</h3>
            <div className="space-y-4">
                {(result.questions || []).map((question, index) => {
                    const selected = question.selectedOptions || [];
                    const correct = question.correctAnswers || [];
                    return (
                        <article key={question.questionId || index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex gap-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{index + 1}</span>
                                    <h4 className="text-sm font-semibold leading-6">{question.question}</h4>
                                </div>
                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${question.isCorrect ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                                    {question.isCorrect ? `+${question.totalMarks}` : `0 / ${question.totalMarks}`}
                                </span>
                            </div>
                            <div className="mt-4 space-y-2 pl-10">
                                {(question.options || []).map((option, optionIndex) => {
                                    const wasSelected = selected.includes(optionIndex);
                                    const isCorrect = correct.includes(optionIndex);
                                    const tone = isCorrect ? "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100" : wasSelected ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100" : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300";
                                    return (
                                        <div key={optionIndex} className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-sm ${tone}`}>
                                            <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                                            <span className="text-xs font-medium">{isCorrect ? "Correct answer" : wasSelected ? "Your answer" : ""}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {question.explanation && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{question.explanation}</p>}
                        </article>
                    );
                })}
            </div>
        </section>
    </div>
);

const ResultMetric = ({ label, value }) => (
    <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-sm font-semibold">{value ?? "—"}</p>
    </div>
);

const LoadingState = () => (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading quiz...</p>
        </div>
    </div>
);

export default QuizPage;
