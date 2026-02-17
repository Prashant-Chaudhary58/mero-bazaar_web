"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import api from "@/lib/axios";

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);

interface UserForm {
    fullName: string;
    phone: string;
    role: string;
    password?: string; // Optional on edit
    address?: string;
    city?: string;
    district?: string;
    province?: string;
}

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, reset } = useForm<UserForm>();

    useEffect(() => {
        if (params.id) {
            fetchUser(params.id as string);
        }
    }, [params.id]);

    const fetchUser = async (id: string) => {
        try {
            const res = await api.get(`/api/admin/users/${id}`);
            if (res.data.success) {
                const u = res.data.data;
                reset({
                    fullName: u.fullName,
                    phone: u.phone,
                    role: u.role,
                    address: u.address,
                    city: u.city,
                    district: u.district,
                    province: u.province
                });
                if (u.image && u.image !== "no-photo.jpg") {
                    // Use rewrite path if available, or fallback to absolute if needed. 
                    // Given next.config.ts has rewrites for /uploads, we can use relative.
                    // But to be safe, if we are on localhost:3000, /uploads goes to backend.
                    setImagePreview(`/uploads/users/${u.image}`);
                }
            } else {
                toast.error("Failed to load user");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching user");
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

    const onSubmit = async (data: UserForm) => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("fullName", data.fullName);
            formData.append("phone", data.phone);
            formData.append("role", data.role);
            if (data.password) formData.append("password", data.password); // Only send if provided
            if (data.address) formData.append("address", data.address);
            if (data.city) formData.append("city", data.city);
            if (data.district) formData.append("district", data.district);
            if (data.province) formData.append("province", data.province);

            if (fileInputRef.current?.files?.[0]) {
                formData.append("image", fileInputRef.current.files[0]);
            }

            // Axios automatically sets Content-Type to multipart/form-data when body is FormData
            const res = await api.put(`/api/admin/users/${params.id}`, formData);

            if (res.data.success) {
                toast.success("User updated successfully");
                router.push("/admin/users");
            } else {
                toast.error(res.data.error || "Failed to update user");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Error updating user");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={() => router.back()} className="mr-4 text-green-800 flex items-center gap-2 font-medium">
                    <BackIcon /> Back
                </button>
                <h1 className="text-2xl font-bold">Edit User: {params.id}</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-100 flex items-center justify-center">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400">Photo</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 text-sm text-green-700 font-medium"
                    >
                        Change Photo
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input {...register("fullName", { required: true })} className="mt-1 w-full border rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input {...register("phone", { required: true })} className="mt-1 w-full border rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password (Leave blank to keep current)</label>
                        <input type="password" {...register("password")} className="mt-1 w-full border rounded-md p-2" placeholder="********" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select {...register("role")} className="mt-1 w-full border rounded-md p-2">
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input {...register("address")} className="mt-1 w-full border rounded-md p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input {...register("city")} className="mt-1 w-full border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">District</label>
                            <input {...register("district")} className="mt-1 w-full border rounded-md p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Province</label>
                        <select {...register("province")} className="mt-1 w-full border rounded-md p-2">
                            <option value="">Select Province</option>
                            <option value="Koshi">Koshi</option>
                            <option value="Madhesh">Madhesh</option>
                            <option value="Bagmati">Bagmati</option>
                            <option value="Gandaki">Gandaki</option>
                            <option value="Lumbini">Lumbini</option>
                            <option value="Karnali">Karnali</option>
                            <option value="Sudurpashchim">Sudurpashchim</option>
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => router.push('/admin/users')} className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50">
                            {saving ? "Saving..." : "Update User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
