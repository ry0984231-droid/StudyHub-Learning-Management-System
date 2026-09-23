import React, { useEffect, useState } from "react";
import {
    CreditCard,
    CheckCircle2,
    Receipt,
} from "lucide-react";
import { api } from "../services/api.js";

export const PaymentHistoryPage = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPayments = async () => {
            try {
                setLoading(true);

                const response = await api.getPaymentHistory();

                setRows(response?.data || []);
            } catch (error) {
                console.error("Failed to load payment history:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPayments();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8">

                {/* Header */}
                <div className="mb-7 border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Receipt className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Payment History
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                View your StudyHub course transactions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center">
                        <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

                        <p className="mt-4 text-sm text-gray-500">
                            Loading payment history...
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                        {/* Table Header */}
                        <div className="hidden grid-cols-5 gap-4 border-b border-gray-200 bg-gray-50 p-4 text-xs font-bold uppercase tracking-wide text-gray-500 md:grid">
                            <span>Course</span>
                            <span>Amount</span>
                            <span>Status</span>
                            <span>Date</span>
                            <span>Payment ID</span>
                        </div>

                        {/* Payment Rows */}
                        {rows.length > 0 ? (
                            rows.map((payment, index) => (
                                <div
                                    key={payment._id || index}
                                    className="grid gap-4 border-b border-gray-200 p-5 last:border-0 md:grid-cols-5 md:items-center"
                                >
                                    {/* Course */}
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                            <CreditCard className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-gray-900">
                                                {payment.course?.title ||
                                                    payment.courseTitle ||
                                                    "Course"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <p className="text-xs text-gray-400 md:hidden">
                                            Amount
                                        </p>

                                        <p className="font-semibold text-gray-900">
                                            ₹{payment.amount ?? payment.price ?? 0}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <p className="mb-1 text-xs text-gray-400 md:hidden">
                                            Status
                                        </p>

                                        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                            <CheckCircle2 className="h-3 w-3" />

                                            {payment.status || "Paid"}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <p className="mb-1 text-xs text-gray-400 md:hidden">
                                            Date
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {payment.createdAt
                                                ? new Date(
                                                    payment.createdAt
                                                ).toLocaleDateString()
                                                : "-"}
                                        </p>
                                    </div>

                                    {/* Payment ID */}
                                    <div className="min-w-0">
                                        <p className="mb-1 text-xs text-gray-400 md:hidden">
                                            Payment ID
                                        </p>

                                        <p
                                            className="truncate text-xs text-gray-400"
                                            title={
                                                payment.paymentId ||
                                                payment.razorpayPaymentId ||
                                                "-"
                                            }
                                        >
                                            {payment.paymentId ||
                                                payment.razorpayPaymentId ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Empty State */
                            <div className="bg-gray-50 px-6 py-14 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                                    <CreditCard className="h-7 w-7 text-gray-400" />
                                </div>

                                <h3 className="mt-4 font-semibold text-gray-800">
                                    No payment records found
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Your StudyHub course payments will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistoryPage;