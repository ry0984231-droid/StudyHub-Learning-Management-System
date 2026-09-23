import React, { useEffect, useState } from "react";
import {
    Award, ShieldCheck, CheckCircle, Download,
    Share2, QrCode, Check, Search
} from "lucide-react";

import { api } from "../services/api.js";

export const VerifyCertificatePage = ({
    initialCertId = "",
    setCurrentView
}) => {
    const [certId, setCertId] = useState(initialCertId);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (initialCertId) verify(initialCertId);
    }, [initialCertId]);

    const verify = async (value = certId) => {
        const id = value.trim();
        if (!id) return;

        setLoading(true);
        setError("");
        setCertificate(null);

        try {
            const res = await api.verifyCertificate(id);

            if (res.success) setCertificate(res.data);
            else setError(res.message || "Certificate not found.");
        } catch (err) {
            console.error("Certificate verification error:", err);
            setError("Unable to verify this certificate.");
        } finally {
            setLoading(false);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error("Copy error:", err);
        }
    };

    const shareLinkedIn = () => {
        if (!certificate) return;

        const url = encodeURIComponent(window.location.href);

        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            "_blank"
        );
    };

    const issueDate = certificate?.issueDate
        ? new Date(certificate.issueDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
        : "";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Header + Search */}
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
                        <ShieldCheck className="text-blue-600" />
                    </div>

                    <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                        Certificate Verification
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Verify a StudyHub certificate using its certificate ID.
                    </p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            verify();
                        }}
                        className="max-w-xl mx-auto mt-5 flex gap-2 p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                            <input
                                value={certId}
                                onChange={(e) => setCertId(e.target.value)}
                                placeholder="Enter certificate ID"
                                className="w-full py-2.5 pl-9 pr-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Verifying..." : "Verify"}
                        </button>
                    </form>

                    {error && (
                        <div className="max-w-xl mx-auto mt-3 p-3 rounded-lg border border-red-200 bg-red-50 text-left text-sm text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                {/* Certificate */}
                {certificate && (
                    <>
                        {/* Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-green-200 bg-green-50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-green-600 text-white">
                                    <CheckCircle size={18} />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-green-900">
                                        Certificate Verified
                                    </h3>

                                    <p className="text-xs text-green-700">
                                        This certificate is verified by StudyHub.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={copyLink}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-white text-xs font-semibold text-gray-700"
                                >
                                    {copied
                                        ? <Check size={14} className="text-green-600" />
                                        : <Share2 size={14} />}
                                    {copied ? "Copied" : "Share"}
                                </button>

                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                                >
                                    <Download size={14} />
                                    Print
                                </button>
                            </div>
                        </div>

                        {/* Certificate Card */}
                        <div
                            id="printable-certificate"
                            className="p-6 sm:p-10 bg-white dark:bg-slate-900 border-4 border-blue-800 rounded-2xl shadow-sm"
                        >
                            <div className="p-5 sm:p-8 border border-blue-200">

                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-700">
                                        <Award size={16} />
                                        StudyHub
                                    </div>

                                    <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        Certificate of Completion
                                    </h2>

                                    <div className="w-16 h-1 mx-auto mt-2 rounded-full bg-blue-600" />

                                    <p className="mt-4 text-xs uppercase tracking-wider text-gray-500">
                                        This is to certify that
                                    </p>
                                </div>

                                {/* Student */}
                                <div className="max-w-xl mx-auto mt-4 pb-2 border-b text-center">
                                    <h3 className="text-2xl font-bold text-blue-900">
                                        {certificate.studentName}
                                    </h3>
                                </div>

                                {/* Course */}
                                <div className="max-w-2xl mx-auto mt-5 text-center">
                                    <p className="text-sm text-gray-600">
                                        has successfully completed the requirements for
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold text-gray-900">
                                        {certificate.courseTitle}
                                    </h3>

                                    <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                        Grade: {certificate.grade}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="mt-8 pt-6 border-t grid gap-5 sm:grid-cols-3">

                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-gray-400">
                                            Issue Date
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-800">
                                            {issueDate}
                                        </p>

                                        <p className="mt-2 break-all font-mono text-[10px] text-gray-400">
                                            ID: {certificate.certificateId}
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="w-20 h-20 flex flex-col items-center justify-center rounded-full bg-blue-600 text-white">
                                            <Award size={24} />
                                            <span className="mt-1 text-[8px] font-bold uppercase">
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-center sm:text-right">
                                        <p className="pb-1 border-b text-sm font-semibold text-gray-800">
                                            {certificate.instructorName}
                                        </p>

                                        <p className="mt-1 text-[10px] font-bold uppercase text-gray-400">
                                            Faculty Instructor
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Share */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border bg-white dark:bg-slate-900">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50">
                                    <QrCode size={16} className="text-blue-600" />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                                        Verification URL
                                    </p>

                                    <p className="mt-1 break-all font-mono text-[11px] text-blue-600">
                                        /verify-certificate/{certificate.certificateId}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={shareLinkedIn}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                            >
                                <Share2 size={16} />
                                Share on LinkedIn
                            </button>
                        </div>
                    </>
                )}

                {/* Empty */}
                {!certificate && !loading && !error && (
                    <div className="p-10 text-center rounded-2xl border bg-white dark:bg-slate-900">
                        <Award className="mx-auto text-blue-400" size={40} />

                        <h3 className="mt-3 text-lg font-bold">
                            Verify a StudyHub Certificate
                        </h3>

                        <p className="max-w-md mx-auto mt-1 text-sm text-gray-500">
                            Enter a certificate ID above to view and verify certificate details.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyCertificatePage;