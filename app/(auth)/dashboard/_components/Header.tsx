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
    cachedImage?: string;
}

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        // 1. Try to load from localStorage first
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }

        // 2. Fetch fresh data from backend
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
                const userData = data.data;

                // Cache Image as Base64
                if (userData.image && userData.image !== 'no-photo.jpg') {
                    try {
                        const imgRes = await fetch(`http://localhost:5001/public/uploads/${userData.image}`);
                        const blob = await imgRes.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64data = reader.result;
                            // Add base64 image to user object for local storage
                            const userWithCachedImage = { ...userData, cachedImage: base64data };
                            setUser(userWithCachedImage);
                            localStorage.setItem("user", JSON.stringify(userWithCachedImage));
                        };
                        reader.readAsDataURL(blob);
                    } catch (imgError) {
                        console.error("Failed to cache image", imgError);
                        // Fallback: save user without cached image if image fetch fails
                        setUser(userData);
                        localStorage.setItem("user", JSON.stringify(userData));
                    }
                } else {
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            }
        } catch (error) {
            console.error(error);
            // If fetch fails (backend down), we rely on the initial localStorage load
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5001/api/v1/auth/logout", {
                credentials: "include",
            });
            // 4. Clear localStorage on logout
            localStorage.removeItem("user");
            setUser(null); // Clear state immediately
            router.push("/login");
            toast.success("Logged out successfully");
        } catch (error) {
            console.error(error);
            // Even if api fails, clear local state
            localStorage.removeItem("user");
            setUser(null);
            router.push("/login");
            toast.success("Logged out (Server Unreachable)");
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
                    <div className="flex items-center gap-5">
                        {/* Cart Icon */}
                        <button className="relative text-gray-600 hover:text-[#4B7321] transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>

                        {/* Notification Icon */}
                        <button className="relative text-gray-600 hover:text-[#4B7321] transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        <div className="relative" ref={popupRef}>
                            <button
                                onClick={() => setShowPopup(!showPopup)}
                                className="focus:outline-none flex items-center"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-100 hover:border-[#4B7321] transition">
                                    {user.image && user.image !== 'no-photo.jpg' ? (
                                        <img
                                            src={user.cachedImage || `http://localhost:5001/public/uploads/${user.image}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback if cached image fails or backend url fails
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('bg-gray-200');
                                                // Could show SVG here but simply hiding for now or letting it stay empty
                                            }}
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
                    </div>
                )}
            </div>
        </nav>
    );
}
