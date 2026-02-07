"use client";

import Link from "next/link";

const BackIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m15 18-6-6 6-6" />
    </svg>
);

export default function MyListingsPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link href="/dashboard" className="mr-4 text-green-800">
                        <BackIcon />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">My Listings</h1>
                </div>

                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-700">No Listings Yet</h2>
                    <p className="text-gray-500 mt-2">You haven&apos;t added any products yet.</p>
                    <button className="mt-6 bg-[#4B7321] text-white px-6 py-2 rounded-full hover:bg-green-800">
                        Add New Product
                    </button>
                </div>
            </div>
        </div>
    );
}
