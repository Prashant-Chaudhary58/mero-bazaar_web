'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

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
    location?: {
        type: string;
        coordinates: number[];
    };
}

export default function ProfilePage() {
    const router = useRouter();
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
                    setUser(response.data.data);
                    // Set initial preview if image exists
                    if (response.data.data.image && response.data.data.image !== "no-photo.jpg") {
                        setPreviewImage(`http://localhost:5001/uploads/${response.data.data.image}`);
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

        try {
            // Send PUT request to update profile
            // Backend route: PUT /api/v1/auth/:id
            // Note: We need to use axios to send FormData
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

                // Force a reload or router refresh to update header state if needed
                // router.refresh(); 
                // For now, let's relad to ensure header picks up new image
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

                            {/* Set Farm Location Logic */}
                            {user.role === 'seller' && (
                                <div className="mt-4 w-full">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Farm Location</h3>
                                    {user.location ? (
                                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded text-center mb-2">
                                            ✅ Location Set
                                        </div>
                                    ) : (
                                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded text-center mb-2">
                                            ⚠️ Location Not Set
                                        </div>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full text-xs"
                                        onClick={() => toast("Map feature coming soon! Check mobile app for now.")}
                                    >
                                        📍 Set on Map
                                    </Button>
                                </div>
                            )}
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
                                        readOnly // Usually phone is immutable ID, but can enable if needed
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

                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 pt-4">Address Details</h2>
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
                </form>
            </div>
        </div>
    );
}
