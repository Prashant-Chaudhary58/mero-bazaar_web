"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Button } from '@/components/ui/button';

// Dynamically import MapPicker with SSR disabled
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

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
    lat?: string;
    lng?: string;
    location?: {
        type: string;
        coordinates: [number, number];
    };
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [showLocationChoice, setShowLocationChoice] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, reset } = useForm<UserProfile>();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get("/api/v1/auth/me");
            const data = res.data;

            if (data.success) {
                const userData = data.data;

                // Construct location object from lat/lng if available and location is missing
                if (!userData.location && userData.lat && userData.lng) {
                    userData.location = {
                        type: 'Point',
                        coordinates: [parseFloat(userData.lng), parseFloat(userData.lat)]
                    };
                }

                setUser(userData);
                reset(userData);

                // Fix image path logic
                if (userData.image && userData.image !== 'no-photo.jpg') {
                    // Assuming uploads are at /uploads/users/
                    // Using relative path to leverage Next.js rewrite
                    setImagePreview(`/uploads/users/${userData.image}`);
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

    const handleLocationSelect = (lat: number, lng: number) => {
        if (user) {
            setUser({
                ...user,
                lat: lat.toString(),
                lng: lng.toString(),
                location: {
                    type: 'Point',
                    coordinates: [lng, lat],
                },
            });
            setShowMap(false);
            toast.success("Location selected! Click Save to update.");
        }
    };

    const handleAutoGPS = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        const toastId = toast.loading("Fetching current location...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                handleLocationSelect(latitude, longitude);
                toast.dismiss(toastId);
                setShowLocationChoice(false);
            },
            (error) => {
                console.error(error);
                toast.error("Unable to retrieve your location");
                toast.dismiss(toastId);
            }
        );
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
            formData.append("role", user.role);
            formData.append("dob", data.dob || "");
            formData.append("province", data.province || "");
            formData.append("district", data.district || "");
            formData.append("city", data.city || "");
            formData.append("address", data.address || "");
            formData.append("altPhone", data.altPhone || "");

            // Append Location
            if (user.location && user.location.coordinates) {
                formData.append('lng', user.location.coordinates[0].toString());
                formData.append('lat', user.location.coordinates[1].toString());
            } else if (user.lat && user.lng) {
                formData.append('lat', user.lat);
                formData.append('lng', user.lng);
            }

            if (fileInputRef.current?.files?.[0]) {
                formData.append("image", fileInputRef.current.files[0]);
            }

            const res = await api.put(`/api/v1/auth/${user._id}`, formData);

            const result = res.data;
            if (result.success) {
                toast.success("Profile updated successfully!");
                setUser(result.data);
                // Assuming uploads are at /uploads/users/
                if (result.data.image && result.data.image !== 'no-photo.jpg') {
                    setImagePreview(`/uploads/users/${result.data.image}?t=${new Date().getTime()}`);
                }
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

            {/* Map Modal */}
            {showMap && (
                <MapPicker
                    initialLocation={
                        user?.location?.coordinates
                            ? [user.location.coordinates[1], user.location.coordinates[0]]
                            : undefined
                    }
                    onLocationSelect={handleLocationSelect}
                    onCancel={() => setShowMap(false)}
                />
            )}

            {/* Location Choice Modal */}
            {showLocationChoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-semibold mb-4 text-center">Set Location</h3>
                        <p className="text-gray-500 text-center mb-6">How would you like to set your farm location?</p>

                        <div className="space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full py-6 flex items-center justify-center gap-2 text-base border-primary/20 hover:bg-primary/5 hover:text-primary"
                                onClick={handleAutoGPS}
                            >
                                🎯 Use Current GPS
                            </Button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <Button
                                type="button"
                                className="w-full py-6 flex items-center justify-center gap-2 text-base"
                                onClick={() => {
                                    setShowLocationChoice(false);
                                    setShowMap(true);
                                }}
                            >
                                🗺️ Pick on Map
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full mt-4 text-gray-400"
                            onClick={() => setShowLocationChoice(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Header */}
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
                            type="date"
                            placeholder="Date of Birth"
                            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-green-700 outline-none text-gray-500"
                        />
                    </div>

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

                    {/* Location Buttons - Only for Sellers */}
                    {user?.role === 'seller' && (
                        <div className="mb-6 border-t pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
                            <div className="flex gap-2 mb-2">
                                <Button
                                    type="button"
                                    onClick={() => setShowLocationChoice(true)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    📍 Set Location
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setShowMap(true)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    🗺️ Map
                                </Button>
                            </div>
                            {user.location && user.location.coordinates && (
                                <p className="text-xs text-green-600 text-center">
                                    ✅ Selected: {user.location.coordinates[1].toFixed(4)}, {user.location.coordinates[0].toFixed(4)}
                                </p>
                            )}
                        </div>
                    )}

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
