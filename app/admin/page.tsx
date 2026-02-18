"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ pendingProducts: 0, totalUsers: 0 });
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            fetchStats();
        } else {
            router.push("/login");
        }
    }, [router]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/api/admin/stats');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    if (!user) return null;

    const switchBackRole = user.role === 'seller' ? 'Seller' : 'Buyer';

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {user.fullName}</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center">
                        <span className="mr-2">🔙</span> Switch to {switchBackRole}
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Stats Cards */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Verifications</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingProducts}</p>
                    <Link href="/admin/products/pending" className="text-blue-600 text-sm mt-4 inline-block hover:underline">View Pending &rarr;</Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
                    <Link href="/admin/users" className="text-blue-600 text-sm mt-4 inline-block hover:underline">Manage Users &rarr;</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <Link href="/admin/products/pending" className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition">
                            Verify Pending
                        </Link>
                        <Link href="/admin/products" className="bg-[#4B7321] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition">
                            Manage All Products
                        </Link>
                        <Link href="/admin/users" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                            Manage Users
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    );
}
