"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface EditUserInput {
    fullName: string;
    phone: string;
    email: string;
    role: string;
    image: FileList;
}

export default function EditUserPage() {
    const { id } = useParams();
    const router = useRouter();
    const { register, handleSubmit, reset } = useForm<EditUserInput>();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`http://localhost:5001/api/admin/users/${id}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                reset(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async (data: EditUserInput) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("fullName", data.fullName);
            formData.append("phone", data.phone);
            formData.append("email", data.email || "");
            formData.append("role", data.role); // Role update might require care, but admin can do it

            if (data.image && data.image[0]) {
                formData.append("image", data.image[0]);
            }

            const res = await fetch(`http://localhost:5001/api/admin/users/${id}`, {
                method: "PUT",
                body: formData,
                credentials: "include",
            });

            const result = await res.json();

            if (result.success) {
                toast.success("User updated successfully");
                router.push("/admin/users");
            } else {
                toast.error(result.error || "Failed to update");
            }
        } catch (error) {
            toast.error("Error updating user");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit User</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        {...register("fullName")}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        {...register("phone")}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        {...register("email")}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        {...register("role")}
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
                        className="mt-1 block w-full text-sm text-gray-500"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#4B7321] text-white py-2 px-4 rounded-md hover:bg-green-800 disabled:opacity-50"
                    >
                        {submitting ? "Updating..." : "Update User"}
                    </button>
                </div>
            </form>
        </div>
    );
}
