'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

// Dynamically import MapPicker with SSR disabled
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

interface User {
    _id: string;
    fullName: string;
    phone: string;
    role: string;
    image?: string;
    email?: string;
    dob?: string;
    province?: string;
    district?: string;
    city?: string;
    address?: string;
    altPhone?: string;
    // Location can be null or object
    location?: {
        type: string;
        coordinates: [number, number]; // [lat, lng] -> No, GeoJSON is [lng, lat] usually
    };
}

export default function ProfilePage() {
    const router = useRouter();
    const [showMap, setShowMap] = useState(false); // State for map modal
    const [showLocationChoice, setShowLocationChoice] = useState(false); // State for choice modal

    // User Data State
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch User Data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/api/v1/auth/me');
                if (response.data.success) {
                    const userData = response.data.data;

                    // Construct location object from lat/lng if available and location is missing
                    if (!userData.location && userData.lat && userData.lng) {
                        userData.location = {
                            type: 'Point',
                            coordinates: [parseFloat(userData.lng), parseFloat(userData.lat)]
                        };
                    }

                    setUser(userData);
                    // Set initial preview if image exists
                    if (userData.image && userData.image !== "no-photo.jpg") {
                        setPreviewImage(`http://localhost:5001/uploads/users/${userData.image}`);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user", error);
                toast.error("Failed to load profile");
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        // ... (keep handleImageChange and handleLocationSelect same)

        // ... inside handleSubmit ...
        // Append Location manually if it exists
        if (user.location && user.location.coordinates) {
            // Backend expects lat and lng fields
            formData.append('lng', user.location.coordinates[0].toString());
            formData.append('lat', user.location.coordinates[1].toString());
        }

        // ... inside return JSX ...
        {
            user.role === 'seller' && (
                <div className="mb-6">
                    <div className="flex gap-4 mb-2">
                        <Button
                            type="button"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium shadow-sm transition-all active:scale-[0.98]"
                            onClick={() => setShowLocationChoice(true)}
                        >
                            📍 Set Farm Location (Auto-Fill)
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium shadow-sm transition-all active:scale-[0.98]"
                            onClick={() => setShowMap(true)}
                        >
                            🗺️ Pick on Map
                        </Button>
                    </div>

                    {user.location && user.location.coordinates && (
                        <p className="text-xs text-green-600 mt-2 text-center">
                            ✅ Location is currently set to: {user.location.coordinates[1].toFixed(4)}, {user.location.coordinates[0].toFixed(4)}
                        </p>
                    )}
                </div>
            )
        }

        fetchUser();
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        if (user) {
            // Update local user state immediately for UI feedback
            setUser({
                ...user,
                location: {
                    type: 'Point',
                    coordinates: [lng, lat], // GeoJSON usage: [lng, lat]
                },
            });
            setShowMap(false);
            toast.success("Location selected! Click Save Changes to update.");
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
                // Reverse geocoding could happen here to fill address fields if needed
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        // Append image if selected
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        // Append Location manually if it exists
        // Backend expects text fields or JSON string? 
        // Usually simpler to send as individual fields 'lat', 'lng' OR 'location' as JSON string
        // Let's assume sending as 'location' JSON string is best if backend supports it.
        // OR checking auth_controller: it usually updates req.body directly.
        // If Model has location: { type: Point ... }, we might need to send:
        // location[type]=Point&location[coordinates][0]=lng&location[coordinates][1]=lat
        // Or if backend parses JSON from text field:
        // Append Location manually if it exists
        if (user.location && user.location.coordinates) {
            // Backend expects lat and lng fields
            formData.append('lng', user.location.coordinates[0].toString());
            formData.append('lat', user.location.coordinates[1].toString());
        }

        try {
            // Send PUT request to update profile
            const response = await api.put(`/api/v1/auth/${user._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success("Profile updated successfully! 🎉");
                const updatedUser = response.data.data;
                setUser(updatedUser);

                // Update localStorage so header reflects changes immediately
                localStorage.setItem('user', JSON.stringify(updatedUser));

                window.location.reload();
            }
        } catch (error: any) {
            console.error("Update failed", error);
            const msg = error.response?.data?.error || "Failed to update profile";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
            {/* Map Modal */}
            {showMap && (
                <MapPicker
                    initialLocation={
                        user.location?.coordinates
                            ? [user.location.coordinates[1], user.location.coordinates[0]] // [lat, lng] for Leaflet
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

            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="bg-primary/10 p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Profile</h1>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold capitalize">
                        {user.role}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Left Side: Image Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary text-white text-5xl font-bold">
                                            {user.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Camera Overlay */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium"
                                >
                                    Change Photo
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <p className="text-xs text-center text-gray-500 max-w-[150px]">
                                Click to upload a new profile picture. JPG, PNG supported.
                            </p>

                            {/* Set Farm Location Logic - Moved to Main Form */}
                        </div>

                        {/* Right Side: Fields */}
                        <div className="flex-1 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <Input
                                        name="fullName"
                                        defaultValue={user.fullName}
                                        placeholder="Enter your name"
                                        className="text-black"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <Input
                                        name="phone"
                                        defaultValue={user.phone}
                                        placeholder="98XXXXXXXX"
                                        className="text-black bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        defaultValue={user.email}
                                        placeholder="you@example.com"
                                        className="text-black"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                                    <Input
                                        name="dob"
                                        defaultValue={user.dob}
                                        placeholder="YYYY-MM-DD"
                                        className="text-black"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Location Details</h2>

                                {user.role === 'seller' && (
                                    <div className="mb-6">
                                        <div className="flex gap-4 mb-2">
                                            <Button
                                                type="button"
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium shadow-sm transition-all active:scale-[0.98]"
                                                onClick={() => setShowLocationChoice(true)}
                                            >
                                                📍 Set Farm Location (Auto-Fill)
                                            </Button>
                                            <Button
                                                type="button"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium shadow-sm transition-all active:scale-[0.98]"
                                                onClick={() => setShowMap(true)}
                                            >
                                                🗺️ Pick on Map
                                            </Button>
                                        </div>

                                        {user.location && user.location.coordinates && (
                                            <p className="text-xs text-green-600 mt-2 text-center">
                                                ✅ Location is currently set to: {user.location.coordinates[1].toFixed(4)}, {user.location.coordinates[0].toFixed(4)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Province</label>
                                        <Input
                                            name="province"
                                            defaultValue={user.province}
                                            placeholder="e.g. Bagmati"
                                            className="text-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">District</label>
                                        <Input
                                            name="district"
                                            defaultValue={user.district}
                                            placeholder="e.g. Kathmandu"
                                            className="text-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">City / Municipality</label>
                                        <Input
                                            name="city"
                                            defaultValue={user.city}
                                            placeholder="e.g. Kathmandu Metro"
                                            className="text-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Street Address</label>
                                        <Input
                                            name="address"
                                            defaultValue={user.address}
                                            placeholder="e.g. Balaju-16"
                                            className="text-black"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div >
        </div >
    );
}
