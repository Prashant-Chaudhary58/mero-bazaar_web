"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function UserDetailPage() {
    const { id } = useParams();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                setUser(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/users" className="text-gray-500 hover:text-black">&larr; Back to Users</Link>
            </div>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="h-32 bg-[#4B7321]"></div>
                <div className="px-6 relative">
                    <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white absolute -top-12 overflow-hidden">
                        {user.image && user.image !== 'no-photo.jpg' ? (
                            <img src={`http://localhost:5001/public/uploads/${user.image}`} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">No Img</div>
                        )}
                    </div>
                    <div className="mt-14 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                        <p className="text-gray-500 capitalize">{user.role}</p>
                        <p className="text-gray-400 text-sm mt-1">ID: {user._id}</p>
                    </div>

                    <div className="border-t border-gray-100 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-500 text-sm block">Phone</span>
                            <span className="text-gray-900 font-medium">{user.phone}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Email</span>
                            <span className="text-gray-900 font-medium">{user.email || '-'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Address</span>
                            <span className="text-gray-900 font-medium">{user.address || '-'}, {user.city}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Province</span>
                            <span className="text-gray-900 font-medium">{user.province || '-'}</span>
                        </div>
                    </div>

                    <div className="py-6 border-t border-gray-100 flex gap-4">
                        <Link href={`/admin/users/${user._id}/edit`} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            Edit User
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
