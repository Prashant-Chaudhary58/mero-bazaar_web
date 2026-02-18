"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Product {
    id: string; // or _id
    _id: string; // Mongoose ID
    name: string;
    price: number;
    category: string;
    image: string;
    seller: {
        fullName: string;
        phone: string;
    };
    createdAt: string;
}

export default function AdminPendingProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            const res = await api.get("/api/admin/products/pending");
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load pending products");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string) => {
        try {
            const res = await api.put(`/api/admin/products/${id}/verify`);
            if (res.data.success) {
                toast.success("Product Verified Successfully");
                // Remove from list
                setProducts(products.filter(p => p._id !== id && p.id !== id));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to verify product");
        }
    };

    const handleDeny = async (id: string) => {
        if (!confirm("Are you sure you want to deny (delete) this product?")) return;
        try {
            await api.delete(`/api/v1/products/${id}`);
            toast.success("Product Denied/Deleted");
            setProducts(products.filter(p => p._id !== id && p.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to deny product");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Pending Products</h1>
                <p className="text-gray-500">Verify products before they go live.</p>
            </header>

            {products.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
                    No pending products found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product._id || product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-48 bg-gray-200 relative">
                                <img
                                    src={`http://localhost:5001/uploads/products/${product.image}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.currentTarget.src = '/placeholder.svg'}
                                    alt={product.name}
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                <p className="text-[#4B7321] font-bold">Rs. {product.price}</p>
                                <div className="text-sm text-gray-500 my-2">
                                    <p>Seller: {product.seller?.fullName}</p>
                                    <p>Phone: {product.seller?.phone}</p>
                                    <p>Category: {product.category}</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleDeny(product._id || product.id)}
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                                    >
                                        Deny
                                    </button>
                                    <button
                                        onClick={() => handleVerify(product._id || product.id)}
                                        className="flex-1 bg-[#4B7321] text-white py-2 rounded-lg hover:bg-green-800 transition"
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
