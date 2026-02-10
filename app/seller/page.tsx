'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';

interface User {
    _id: string;
    role: string;
    fullName: string;
}

export default function SellerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check auth
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/auth/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'seller' && parsedUser.role !== 'farmer') {
            // Handle 'farmer' string which might be used interchangeably with 'seller'
            if (parsedUser.role !== 'farmer') {
                toast.error("Access restricted to Sellers");
                router.push('/');
                return;
            }
        }
        setUser(parsedUser);
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            // Backend doesn't have a direct "get my products" endpoint based on reading `product_route.js`
            // But query param `seller=ID` might work if I implement it, or filtering on client side if API returns all.
            // `getAllProducts` doesn't seem to support filtering by seller ID in `req.query` explicitely, 
            // but Mongoose `find(req.query)` (if implemented that way) would work. 
            // Checking `product_controller.js`: `let query = Product.find();`. It does NOT spread req.query.
            // So I can't filter by seller via API.
            // I will fetch ALL and filter client side for now (Not efficient but works for MVP).
            // OR I can use the existing /products API and filter in JS.

            // Fetch my products from the dedicated endpoint
            const response = await api.get('/api/v1/products/my-products');
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Seller Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Welcome, {user?.fullName}</p>
                    </div>
                    <Link href="/seller/add-product">
                        <Button>+ Add New Product</Button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">My Products</h2>
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                            <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
                            <Link href="/seller/add-product">
                                <Button variant="outline">List your first Item</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
