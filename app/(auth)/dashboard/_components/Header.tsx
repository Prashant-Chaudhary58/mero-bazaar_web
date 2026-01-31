"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface User {
    fullName: string;
    image: string;
    role: string;
}

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUser();

        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setShowPopup(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch("http://localhost:5001/api/v1/auth/me", {
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5001/api/v1/auth/logout", {
                credentials: "include",
            });
            router.push("/login");
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    return (
        <nav className="bg-white px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-8">
                {/* Logo */}
                <Link href="/dashboard">
                    <div className="relative h-12 w-32 md:w-36">
                        <Image
                            src="/images/logo.jpg"
                            alt="Mero Baazar"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>

                {/* Navigation Links (Hidden on mobile, visible on md+) */}
                <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-800">
                    <Link href="/dashboard" className="hover:text-[#4B7321] transition">Home</Link>
                    <Link href="/dashboard#categories" className="hover:text-[#4B7321] transition">Categories</Link>
                    <Link href="/user/listings" className="hover:text-[#4B7321] transition">Listings</Link>
                    <Link href="/contact" className="hover:text-[#4B7321] transition">Contact</Link>
                </div>
            </div>

            {/* Right Side: Auth Buttons or Avatar */}
            <div className="flex items-center gap-4">
                {!user ? (
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/login" className="text-gray-600 hover:text-black">Log in</Link>
                        <Link href="/select-role" className="bg-[#4B7321] text-white px-4 py-2 rounded-full hover:bg-green-800 transition">
                            Sign up
                        </Link>
                    </div>
                ) : (
                    <div className="relative" ref={popupRef}>
                        <button
                            onClick={() => setShowPopup(!showPopup)}
                            className="focus:outline-none flex items-center"
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-100 hover:border-[#4B7321] transition">
                                {user.image && user.image !== 'no-photo.jpg' ? (
                                    <img
                                        src={`http://localhost:5001/public/uploads/${user.image}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>

                        {/* Popup Modal */}
                        {showPopup && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-down">
                                <div className="p-4 border-b border-gray-100">
                                    <p className="font-bold text-gray-800 text-sm">Hello, {user.fullName.split(' ')[0]}</p>
                                    <Link onClick={() => setShowPopup(false)} href="/user/profile" className="text-xs text-[#4B7321] hover:underline">
                                        view & edit your profile
                                    </Link>
                                </div>
                                <div className="py-2">
                                    <Link onClick={() => setShowPopup(false)} href="/user/listings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <span className="mr-3">📦</span> My Listing
                                    </Link>
                                    <button className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <span className="mr-3">🌐</span> Language
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                        <span className="mr-3">🚪</span> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
