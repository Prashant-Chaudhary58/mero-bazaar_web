'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
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
    lat?: string;
    lng?: string;
    location?: {
        type: string;
        coordinates: number[];
    };
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUpdate: (updatedUser: User) => void;
}

// Dynamically import MapPicker with SSR disabled
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
    const [saving, setSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [showMap, setShowMap] = useState(false);
    const [showLocationChoice, setShowLocationChoice] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (user && isOpen) {
            setFormData(user);
            if (user.image && user.image !== "no-photo.jpg") {
                // Append timestamp to prevent caching old image
                const folder = user.role === 'seller' ? 'farmer' : 'buyer';
                setPreviewImage(`http://localhost:5001/uploads/${folder}/${user.image}?t=${new Date().getTime()}`);
            } else {
                setPreviewImage(null);
            }
            setSelectedFile(null);
        }
    }, [user, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    const [loadingLocation, setLoadingLocation] = useState(false);

    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                const updates: Partial<User> = {
                    province: addr.state || addr.region || "",
                    district: addr.county || addr.district || "",
                    city: addr.city || addr.town || addr.village || "",
                    address: addr.road || addr.suburb || ""
                };
                setFormData(prev => ({ ...prev, ...updates }));
                toast.success("Address updated from location!");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            toast.error("Failed to fetch address details.");
        }
    };

    const handleLocationSelect = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            lat: lat.toString(),
            lng: lng.toString(),
            location: {
                type: 'Point',
                coordinates: [lng, lat],
            },
        }));

        // Fetch address for the selected location
        fetchAddress(lat, lng);

        setShowMap(false);
        toast.success("Location set! Click Save to apply changes.");
    };

    const handleAutoFillLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                handleLocationSelect(latitude, longitude);
                // fetchAddress is called within handleLocationSelect now
                setShowLocationChoice(false);
                setLoadingLocation(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                let msg = "Failed to get location.";
                if (error.code === 1) msg = "Location permission denied.";
                toast.error(msg);
                setLoadingLocation(false);
            }
        );
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        const submitData = new FormData();

        // Append all text fields
        Object.keys(formData).forEach(key => {
            const value = (formData as any)[key];
            if (value !== undefined && value !== null && key !== 'image' && key !== 'location' && key !== 'lat' && key !== 'lng') {
                submitData.append(key, value as string);
            }
        });

        // Explicitly append lat/lng
        // Prioritize formData (newly selected), fall back to user (existing)
        const lat = formData.lat || user.lat;
        const lng = formData.lng || user.lng;

        if (lat) submitData.append('lat', lat.toString());
        if (lng) submitData.append('lng', lng.toString());

        // Append image if selected
        if (selectedFile) {
            submitData.append('image', selectedFile);
        }

        try {
            const response = await api.put(`/api/v1/auth/${user._id}`, submitData);

            if (response.data.success) {
                toast.success("Profile saved successfully");
                onUpdate(response.data.data);
                onClose();
            }
        } catch (error: any) {
            console.error("Update failed", error);
            const msg = error.response?.data?.error || "Failed to update profile";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="My Account">
            <div className="p-4 space-y-4">
                {/* Avatar Section */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-3xl font-bold">
                                    {user.fullName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-white text-xs font-semibold px-2 py-1 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 text-gray-700"
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
                </div>

                {/* Fields - Styled like mobile screenshot */}
                <div className="space-y-3">
                    <Input
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="bg-gray-100 border-none rounded-lg py-6 text-base text-black font-medium"
                    />

                    <Input
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        placeholder="Email"
                        type="email"
                        className="bg-gray-100 border-none rounded-lg py-6 text-base text-black"
                    />

                    {/* Province Dropdown mockup */}
                    <div className="relative">
                        <select
                            name="province"
                            value={formData.province || ''}
                            onChange={handleInputChange}
                            className="w-full bg-gray-100 border-none rounded-lg p-3 text-base text-black appearance-none outline-none"
                        >
                            <option value="">Select Province</option>
                            <option value="Koshi">Koshi</option>
                            <option value="Madhesh">Madhesh</option>
                            <option value="Bagmati">Bagmati</option>
                            <option value="Gandaki">Gandaki</option>
                            <option value="Lumbini">Lumbini</option>
                            <option value="Karnali">Karnali</option>
                            <option value="Sudurpashchim">Sudurpashchim</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-600">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>

                    <Input
                        name="district"
                        value={formData.district || ''}
                        onChange={handleInputChange}
                        placeholder="District (e.g. Kathmandu)"
                        className="bg-gray-100 border-none rounded-lg py-6 text-base text-black"
                    />

                    <Input
                        name="city"
                        value={formData.city || ''}
                        onChange={handleInputChange}
                        placeholder="City (e.g. Kathmandu)"
                        className="bg-gray-100 border-none rounded-lg py-6 text-base text-black"
                    />

                    <Input
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        placeholder="Address"
                        className="bg-gray-100 border-none rounded-lg py-6 text-base text-black"
                    />

                    {/* Location Buttons */}
                    {user.role === 'seller' && (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-lg flex items-center justify-center gap-2"
                                    onClick={() => setShowLocationChoice(true)}
                                >
                                    📍 Set Location
                                </Button>
                            </div>
                            {formData.location?.coordinates && (
                                <p className="text-xs text-green-600 text-center">
                                    ✅ Selected: {formData.location.coordinates[1].toFixed(4)}, {formData.location.coordinates[0].toFixed(4)}
                                </p>
                            )}
                        </div>
                    )}

                    <Input
                        name="phone"
                        value={formData.phone || ''}
                        readOnly
                        className="bg-gray-200 border-none rounded-lg py-6 text-base text-gray-500 cursor-not-allowed"
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 mt-8 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-green-500 text-green-600 hover:bg-green-50 py-6 rounded-lg font-medium"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="flex-1 bg-[#4B7321] hover:bg-[#3d5d1a] text-white py-6 rounded-lg font-medium"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>


            {/* Map Modal */}
            {
                showMap && (
                    <MapPicker
                        initialLocation={
                            formData.location?.coordinates
                                ? [formData.location.coordinates[1], formData.location.coordinates[0]] // [lat, lng]
                                : undefined
                        }
                        onLocationSelect={handleLocationSelect}
                        onCancel={() => setShowMap(false)}
                    />
                )
            }

            {/* Location Choice Modal */}
            {
                showLocationChoice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" style={{ zIndex: 60 }}>
                        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h3 className="text-xl font-semibold mb-4 text-center">Set Location</h3>
                            <p className="text-gray-500 text-center mb-6">How would you like to set your farm location?</p>

                            <div className="space-y-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full py-6 flex items-center justify-center gap-2 text-base border-primary/20 hover:bg-primary/5 hover:text-primary"
                                    onClick={handleAutoFillLocation}
                                    disabled={loadingLocation}
                                >
                                    {loadingLocation ? "Fetching..." : "🎯 Use Current GPS"}
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
                )
            }
        </Modal >
    );
}
