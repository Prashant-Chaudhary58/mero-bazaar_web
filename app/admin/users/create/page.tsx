"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface CreateUserInput {
    fullName: string;
    phone: string;
    password: string;
    role: string;
    image: FileList;
}

export default function CreateUserPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<CreateUserInput>();
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (data: CreateUserInput) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("fullName", data.fullName);
            formData.append("phone", data.phone);
            formData.append("password", data.password);
            formData.append("role", data.role);

            if (data.image[0]) {
                formData.append("image", data.image[0]);
            }

            const res = await fetch("http://localhost:5001/api/admin/users", {
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
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New User</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        {...register("fullName", { required: "Name is required" })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        {...register("phone", { required: "Phone is required" })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        {...register("role", { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                    >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                    <input
                        type="file"
                        {...register("image")}
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#4B7321] text-white py-2 px-4 rounded-md hover:bg-green-800 disabled:opacity-50"
                >
                    {submitting ? "Creating..." : "Create User"}
                </button>
            </form>
        </div>
    );
}
