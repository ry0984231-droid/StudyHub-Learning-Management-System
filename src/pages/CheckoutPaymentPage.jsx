import React, { useEffect, useState } from "react";
import {
    CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight,
    Download, Lock, ArrowLeft, Sparkles, BookOpen
} from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export const CheckoutPaymentPage = ({ courseId, setCurrentView }) => {
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState("idle");
    const [invoiceData, setInvoiceData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("razorpay");
    const [billingName, setBillingName] = useState(user?.name || "");

    useEffect(() => {
        const loadCourse = async () => {
            setLoading(true);
            try {
                const res = await api.getCourse(courseId);
                if (res?.success) setCourse(res.data);
            } catch (err) {
                console.error("Failed to load course:", err);
            } finally {
                setLoading(false);
            }
        };
        if (courseId) loadCourse();
    }, [courseId]);

    const loadRazorpay = () =>
        new Promise(resolve => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handleProcessPayment = async () => {
        if (!course) return;
        setProcessing(true);
        setPaymentStatus("idle");

        try {
            const orderResponse = await api.createPaymentOrder(course._id);
            const razorpayLoaded = await loadRazorpay();

            if (!orderResponse?.success || !razorpayLoaded || !window.Razorpay)
                throw new Error("Secure payment checkout could not be loaded.");

            const { order } = orderResponse;

            const checkout = new window.Razorpay({
                key: order.keyId,
                amount: Math.round(order.finalAmount * 100),
                currency: order.currency,
                name: "StudyHub",
                description: order.courseTitle,
                order_id: order.orderId,
                prefill: {
                    name: billingName || user?.name || "",
                    email: user?.email || ""
                },
                theme: { color: "#2563eb" },

                handler: async response => {
                    try {
                        const result = await api.verifyPayment({
                            courseId: course._id,
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            paymentMethod: "Razorpay"
                        });

                        if (!result?.success)
                            throw new Error("Payment verification failed.");

                        setInvoiceData(result.payment);
                        setPaymentStatus("success");
                    } catch (err) {
                        console.error("Payment verification error:", err);
                        setPaymentStatus("failed");
                    } finally {
                        setProcessing(false);
                    }
                },

                modal: { ondismiss: () => setProcessing(false) }
            });

            checkout.open();
        } catch (err) {
            console.error("Payment error:", err);
            setPaymentStatus("failed");
            setProcessing(false);
        }
    };

    const handleDownloadInvoice = () => window.print();
    const backToCourse = () =>
        setCurrentView("course-details", { courseId: course._id });
    const startLearning = () =>
        setCurrentView("learn", { courseId: course._id });

    if (loading || !course) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-9 h-9 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="mt-4 text-sm text-gray-500">Loading checkout...</p>
                </div>
            </div>
        );
    }

    const finalPrice = course.discountPrice != null
        ? course.discountPrice
        : course.price;

    const savings = Number(course.price || 0) > Number(finalPrice || 0)
        ? Number(course.price) - Number(finalPrice)
        : 0;

    const price = Number(finalPrice || 0).toLocaleString("en-IN");
    const listPrice = Number(course.price || 0).toLocaleString("en-IN");

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <button type="button" onClick={backToCourse}
                    className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-500 hover:text-blue-600 transition">
                    <ArrowLeft className="w-4 h-4" /> Back to Course
                </button>

                {paymentStatus === "success" && invoiceData && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <p className="text-sm font-semibold text-emerald-600 mb-2">
                                Enrollment Confirmed
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Payment Successful!
                            </h2>
                            <p className="text-sm text-gray-500 max-w-lg mx-auto mt-2">
                                You have been granted full lifetime access to{" "}
                                <span className="font-medium text-gray-700">{course.title}</span>.
                            </p>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="p-5 bg-blue-50 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        StudyHub Payment Receipt
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                        Invoice #{invoiceData.invoiceNumber}
                                    </p>
                                </div>
                                <span className="w-fit px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                    Paid
                                </span>
                            </div>

                            <div className="p-5">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Billed To</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {billingName || user?.name || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Transaction Date
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {invoiceData.date
                                                ? new Date(invoiceData.date).toLocaleDateString("en-IN")
                                                : "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Payment Method</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {invoiceData.paymentMethod || "Razorpay"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Total Paid</p>
                                        <p className="text-sm font-bold text-blue-600">
                                            ₹{Number(invoiceData.finalAmount || 0).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between gap-4">
                                    <span className="text-sm text-gray-600">{course.title}</span>
                                    <span className="font-bold text-gray-900">
                                        ₹{Number(invoiceData.finalAmount || 0).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">
                            <button type="button" onClick={handleDownloadInvoice}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Print Invoice
                            </button>

                            <button id="start-learning-now-btn" type="button" onClick={startLearning}
                                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center justify-center gap-2">
                                Start Learning <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {paymentStatus === "failed" && (
                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
                        <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                            The payment was cancelled or could not be verified.
                            No enrollment was created.
                        </p>

                        <button type="button" onClick={() => setPaymentStatus("idle")}
                            className="mt-6 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition">
                            Retry Payment
                        </button>
                    </div>
                )}

                {paymentStatus === "idle" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <div className="mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">
                                    Secure Checkout
                                </p>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Checkout & Enrollment
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Complete your enrollment securely.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Select Payment Method
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setPaymentMethod("card")}
                                        className={`p-4 rounded-xl border text-left transition ${paymentMethod === "card"
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-gray-200 hover:border-blue-200"
                                            }`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Credit / Debit Card
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Visa, Mastercard
                                                </p>
                                            </div>
                                        </div>
                                    </button>

                                    <button type="button" onClick={() => setPaymentMethod("razorpay")}
                                        className={`p-4 rounded-xl border text-left transition ${paymentMethod === "razorpay"
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-gray-200 hover:border-blue-200"
                                            }`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Razorpay
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    UPI & NetBanking
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Secure Payment
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Your payment is securely processed through Razorpay.
                                    </p>
                                </div>
                            </div>

                            <button id="confirm-pay-now-btn" type="button"
                                disabled={processing} onClick={handleProcessPayment}
                                className="w-full mt-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" />
                                {processing
                                    ? "Opening secure checkout..."
                                    : `Pay ₹${price} & Enroll Now`}
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-3">
                                Secure checkout powered by Razorpay
                            </p>
                        </div>

                        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-fit">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Order Summary
                                </h3>
                            </div>

                            <div className="flex gap-4 py-5">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title}
                                        className="w-24 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                                ) : (
                                    <div className="w-24 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                        {course.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        By {course.instructorName ||
                                            course.instructor?.name ||
                                            "StudyHub Instructor"}
                                    </p>
                                    <p className="text-sm font-bold text-blue-600 mt-1">
                                        ₹{price}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 space-y-3 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>List Price</span>
                                    <span className="line-through">₹{listPrice}</span>
                                </div>

                                {savings > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Discount</span>
                                        <span>-₹{Number(savings).toLocaleString("en-IN")}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-500">
                                    <span>Certificate Fee</span>
                                    <span className="text-emerald-600">Included</span>
                                </div>

                                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="text-xl font-bold text-blue-600">₹{price}</span>
                                </div>
                            </div>

                            <div className="mt-5 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                <div className="flex gap-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-blue-800">
                                        Your payment information is handled securely.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPaymentPage;