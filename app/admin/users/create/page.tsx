"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);

interface UserForm {
    fullName: string;
    phone: string;
    password: string;
    role: string;
    address?: string;
    city?: string;
    district?: string;
    province?: string;
}

export default function CreateUserPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit } = useForm<UserForm>({
        defaultValues: {
            role: "buyer"
        }
    });

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
            formData.append("password", data.password);
            formData.append("role", data.role);
            if (data.address) formData.append("address", data.address);
            if (data.city) formData.append("city", data.city);
            if (data.district) formData.append("district", data.district);
            if (data.province) formData.append("province", data.province);

            if (fileInputRef.current?.files?.[0]) {
                formData.append("image", fileInputRef.current.files[0]);
            }

            // Using POST /api/admin/users as per request to create admin level user management
            // Also user mentioned POST /api/auth/user in request but context implies admin user creation.
            // Admin user creation typically maps to POST /api/admin/users
            const res = await fetch("http://localhost:5000/api/admin/users", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const result = await res.json();
            if (result.success) {
                toast.success("User created successfully");
                router.push("/admin/users");
            } else {
                toast.error(result.error || "Failed to create user");
            }
        } catch (error) {
            toast.error("Error creating user");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={() => router.back()} className="mr-4 text-green-800">
                    <BackIcon />
                </button>
                <h1 className="text-2xl font-bold">Create User</h1>
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
                        Upload Photo
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
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" {...register("password", { required: true, minLength: 6 })} className="mt-1 w-full border rounded-md p-2" />
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

                    <button type="submit" disabled={saving} className="w-full bg-[#4B7321] text-white py-2 rounded-md hover:bg-green-800 transition disabled:opacity-50">
                        {saving ? "Creating..." : "Create User"}
                    </button>
                </form>
            </div>
        </div>
    );
}
