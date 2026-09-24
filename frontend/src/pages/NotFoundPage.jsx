import React from 'react';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage({ setCurrentView }) {
    return (
        <div className="flex min-h-[75vh] items-center justify-center bg-white p-6 text-center">
            <div>

                {/* 404 */}
                <div className="text-8xl font-black tracking-tight text-gray-200">
                    404
                </div>

                {/* Heading */}
                <h1 className="mt-3 text-3xl font-bold text-gray-900">
                    Page Not Found
                </h1>

                {/* Description */}
                <p className="mx-auto mt-3 max-w-md text-gray-500">
                    The page you are looking for does not exist or may have been moved.
                </p>

                {/* Buttons */}
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                    <button
                        onClick={() => setCurrentView('home')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </button>

                    <button
                        onClick={() => setCurrentView('courses')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                        <Search className="h-4 w-4" />
                        Browse Courses
                    </button>

                </div>
            </div>
        </div>
    );
}

