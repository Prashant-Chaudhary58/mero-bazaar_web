"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface User {
    _id: string;
    fullName: string;
    phone: string;
    role: string;
    image: string;
    type?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:5001/api/admin/users", {
                credentials: "include", // Important for admin middleware
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            } else {
                toast.error("Failed to fetch users");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`http://localhost:5001/api/admin/users/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                toast.success("User deleted");
                setUsers(users.filter((u) => u._id !== id));
            } else {
                toast.error(data.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting user");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading users...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <Link
                    href="/admin/users/create"
                    className="bg-[#4B7321] text-white px-4 py-2 rounded-md font-medium hover:bg-green-800 transition"
                >
                    + Add User
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img
                                                className="h-10 w-10 rounded-full object-cover"
                                                src={
                                                    user.image && user.image !== "no-photo.jpg"
                                                        ? `http://localhost:5001/public/uploads/${user.image}` // Fixed Check path
                                                        : "https://via.placeholder.com/40"
                                                }
                                                alt=""
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                                                }}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.fullName}
                                            </div>
                                            <div className="text-sm text-gray-500">{user.type}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'seller' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/admin/users/${user._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                        View
                                    </Link>
                                    <Link href={`/admin/users/${user._id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
