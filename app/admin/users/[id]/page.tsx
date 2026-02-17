"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
);

interface User {
    _id: string;
    fullName: string;
    phone: string;
    role: string;
    image: string;
    address?: string;
    city?: string;
    district?: string;
    province?: string;
}

export default function ViewUserPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchUser(params.id as string);
        }
    }, [params.id]);

    const fetchUser = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5001/api/admin/users/${id}`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data);
            } else {
                toast.error("Failed to load user");
            }
        } catch (error) {
            toast.error("Error fetching user");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!user) return <div className="p-8 text-center">User not found</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <button onClick={() => router.back()} className="mr-4 text-green-800">
                    <BackIcon />
                </button>
                <h1 className="text-2xl font-bold">User Details</h1>
                <Link href={`/admin/users/${user._id}/edit`} className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Edit
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="flex flex-col items-center">
                    <img
                        src={user.image && user.image !== "no-photo.jpg" ? `http://localhost:5001/uploads/users/${user.image}` : "https://via.placeholder.com/150"}
                        alt={user.fullName}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                    />
                    <h2 className="mt-4 text-xl font-bold text-gray-900">{user.fullName}</h2>
                    <span className={`px-3 py-1 mt-2 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'seller' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {user.role.toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                    <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <p className="font-medium">{user.phone}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">User ID</label>
                        <p className="font-medium text-gray-400 text-sm">{user._id}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Address</label>
                        <p className="font-medium">{user.address || "-"}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">City</label>
                        <p className="font-medium">{user.city || "-"}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">District</label>
                        <p className="font-medium">{user.district || "-"}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Province</label>
                        <p className="font-medium">{user.province || "-"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
