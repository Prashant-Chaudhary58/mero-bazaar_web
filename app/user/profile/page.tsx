"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "@/lib/axios";


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

interface UserProfile {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    dob?: string;
    province?: string;
    district?: string;
    city?: string;
    address?: string;
    altPhone?: string;
    image?: string;
    role: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, reset } = useForm<UserProfile>();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            // Ideally move API calls to lib/api.ts, but keeping here for speed/context
            // Using configured api client
            const res = await api.get("/api/v1/auth/me");
            // api client already handling response.data? No, axios returns object with data field. 
            // Our backend returns { success: true, data: ... }
            const data = res.data;

            if (data.success) {
                setUser(data.data);
                reset(data.data); // Prefill form
                // Backend serves uploads at /uploads -> public/uploads
                // BaseURL is http://localhost:5001 (from api.defaults.baseURL or similar if we imported it, 
                // but better to use a constant or just relative if strictly necessary, but sticking to 5001 explicitly or via env var is safer for now given the issue)

                // Since api.defaults.baseURL is http://localhost:5001
                const baseUrl = "http://localhost:5001";

                if (data.data.image && data.data.image !== 'no-photo.jpg') {
                    // Mobile/Uploads logic puts files in 'buyer' or 'farmer' subfolders based on role
                    // But server serves /uploads root. 
                    // So we must append the role folder to the path.
                    // Check upload.js: role === 'seller' ? 'farmer' : 'buyer'
                    // Now standardized to users folder
                    const folder = 'users';
                    setImagePreview(`${baseUrl}/uploads/${folder}/${data.data.image}?t=${new Date().getTime()}`);
                }
            } else {
                toast.error("Failed to load profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading profile");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: UserProfile) => {
        if (!user) return;
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("fullName", data.fullName);
            formData.append("email", data.email || "");
            formData.append("role", user.role); // Crucial for upload middleware fallback
            formData.append("dob", data.dob || "");
            formData.append("province", data.province || "");
            formData.append("district", data.district || "");
            formData.append("city", data.city || "");
            formData.append("address", data.address || "");
            formData.append("altPhone", data.altPhone || "");

            if (fileInputRef.current?.files?.[0]) {
                formData.append("image", fileInputRef.current.files[0]);
            }

            const res = await api.put(`/api/v1/auth/${user._id}`, formData);

            const result = res.data;
            if (result.success) {
                toast.success("Profile updated successfully!");
                setUser(result.data);
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-4">
            {/* Header matching design */}
            <div className="w-full max-w-md bg-white p-4 flex items-center mb-4 sticky top-0 z-10">
                <button onClick={() => router.back()} className="mr-4 text-green-800">
                    <BackIcon />
                </button>
                <h1 className="text-xl font-bold text-black">My Account</h1>
            </div>

            <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-sm">

                {/* Profile Image Section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-100">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                User
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-[-12px] bg-white text-xs px-3 py-1 rounded-full shadow-md border border-gray-200 text-gray-700 font-medium z-10"
                    >
                        Edit
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input
                            {...register("fullName")}
                            placeholder="Full Name"
                            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-700 outline-none text-black"
                        />
                    </div>

                    <div>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="Email"
                            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-700 outline-none text-black"
                        />
                    </div>

                    <div>
                        <input
                            {...register("dob")}
                            type="date" // Or text if design implies custom picker, relying on browser native for now
                            placeholder="Date of Birth"
                            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-700 outline-none text-gray-500" // Text gray if empty?
                        />
                        {/* Note: value handling for date inputs might need formatting */}
                    </div>

                    {/* Province Dropdown */}
                    <div className="relative">
                        <select
                            {...register("province")}
                            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-700 outline-none appearance-none text-black pr-8"
                        >
                            <option value="">Province</option>
                            <option value="Koshi">Koshi</option>
                            <option value="Madhesh">Madhesh</option>
                            <option value="Bagmati">Bagmati</option>
                            <option value="Gandaki">Gandaki</option>
                            <option value="Lumbini">Lumbini</option>
                            <option value="Karnali">Karnali</option>
                            <option value="Sudurpashchim">Sudurpashchim</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div>
                        <input
                            {...register("district")}
                            placeholder="District"
                            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-700 outline-none text-black"
                        />
                    </div>

                    <div>
                        <input
                            {...register("city")}
                            placeholder="City"
                            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-700 outline-none text-black"
                        />
                    </div>

                    <div>
                        <input
                            {...register("address")}
                            placeholder="Home Address"
                            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-700 outline-none text-black"
                        />
                    </div>

                    <div>
                        <input
                            {...register("altPhone")}
                            placeholder="Alternative Phone Number (Optional)"
                            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-700 outline-none text-black"
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            className="flex-1 py-3 border border-green-700 text-green-700 rounded-lg font-medium hover:bg-green-50"
                        >
                            Edit
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 bg-[#4B7321] text-white rounded-lg font-medium hover:bg-green-800 disabled:bg-gray-400"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
