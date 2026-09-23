import React, { useEffect, useState } from "react";
import { Award, ExternalLink, ShieldCheck } from "lucide-react";
import { api } from "../services/api.js";

export const CertificatesPage = ({ setCurrentView }) => {
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getMyCertificates()
            .then(r => setCerts(r?.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto w-full max-w-6xl p-4 sm:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
                    <p className="mt-1 text-gray-500">
                        Your verified course completion certificates.
                    </p>
                </div>

                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">
                        Loading certificates...
                    </div>
                ) : certs.length ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {certs.map(c => {
                            const id = c.certificateId || c._id;
                            const title = c.course?.title || c.courseTitle || "StudyHub Course";

                            return (
                                <div key={c._id}
                                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                                    <div className="border-b border-gray-200 bg-gray-50 p-7">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white">
                                            <Award className="h-7 w-7 text-gray-800" />
                                        </div>
                                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                                            Certificate of Completion
                                        </h2>
                                        <p className="mt-2 text-sm text-gray-600">{title}</p>
                                    </div>

                                    <div className="space-y-4 p-6">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                            <ShieldCheck className="h-4 w-4" />
                                            Verified certificate
                                        </div>

                                        <p className="text-sm text-gray-500">
                                            Certificate ID:{" "}
                                            <span className="font-mono text-gray-800">{id}</span>
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Issued:{" "}
                                            <span className="text-gray-800">
                                                {c.createdAt
                                                    ? new Date(c.createdAt).toLocaleDateString()
                                                    : "-"}
                                            </span>
                                        </p>

                                        <button
                                            onClick={() => setCurrentView("verify-certificate", {
                                                certificateId: id
                                            })}
                                            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                        >
                                            Verify Certificate
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white">
                            <Award className="h-8 w-8 text-gray-400" />
                        </div>
                        <h2 className="mt-4 font-bold text-gray-900">
                            No certificates yet
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Complete an eligible course to earn your first certificate.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificatesPage;