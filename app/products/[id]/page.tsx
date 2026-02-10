'use client';

import { useEffect, useState, use } from 'react';
import DistanceDisplay from '@/components/DistanceDisplay';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Review {
    _id: string;
    title: string;
    text: string;
    rating: number;
    user: {
        fullName: string;
    };
}

interface Product {
    _id: string;
    name: string;
    price: number;
    description: string;
    quantity: string;
    category: string;
    image: string;
    averageRating: number;
    numOfReviews: number;
    seller: {
        _id: string;
        fullName: string;
        phone: string;
        address: string;
        lat: string;
        lng: string;
    };
    reviews?: Review[];
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);

    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ _id: string; role: string; isAdmin?: boolean } | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
    }, []);

    // Review Form State
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [reviewTitle, setReviewTitle] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/api/v1/products/${id}`);
            if (response.data.success) {
                setProduct(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch product", error);
            toast.error("Failed to load product details");
        } finally {
            setLoading(false);
        }
    };

    const handleVisitFarm = () => {
        if (product?.seller?.lat && product.seller?.lng) {
            const lat = product.seller.lat;
            const lng = product.seller.lng;
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        } else {
            toast.error("Seller location not available");
        }
    };

    const handleCallFarmer = () => {
        if (product?.seller?.phone) {
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        setDeleting(true);
        try {
            await api.delete(`/api/v1/products/${id}`);
            toast.success("Product deleted successfully");
            router.push('/');
        } catch (error: any) {
            console.error("Delete failed", error);
            toast.error(error.response?.data?.error || "Failed to delete product");
        } finally {
            setDeleting(false);
        }
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        try {
            setSubmittingReview(true);
            await api.post(`/api/v1/products/${product._id}/reviews`, {
                rating,
                text: reviewText,
                title: reviewTitle
            });
            toast.success("Review submitted!");
            setReviewText("");
            setReviewTitle("");
            fetchProduct(); // Refresh reviews
        } catch (error: any) {
            const msg = error.response?.data?.error || "Failed to submit review";
            if (msg.includes("duplicate")) {
                toast.error("You have already reviewed this product");
            } else if (msg.includes("Not authorized")) {
                toast.error("Please login to review");
                router.push('/auth/login');
            } else {
                toast.error(msg);
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen px-4">Loading...</div>;
    if (!product) return <div className="flex justify-center items-center h-screen px-4">Product not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center">
                <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    ← Back
                </button>
                <h1 className="font-bold text-lg truncate">{product.name}</h1>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Product Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="h-64 sm:h-80 md:h-96 w-full bg-gray-200 relative">
                        <img
                            src={product.image !== 'no-photo.jpg' ? `http://localhost:5001/uploads/${product.image}` : 'https://via.placeholder.com/600'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full font-bold shadow-md">
                            Rs. {product.price}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{product.name}</h2>
                                <span className="inline-block mt-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    {product.category}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-yellow-500 font-bold text-lg">
                                    ★ {product.averageRating.toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500">{product.numOfReviews} reviews</div>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                            {product.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">Quantity</div>
                                <div className="font-semibold">{product.quantity}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">Seller</div>
                                <div className="font-semibold truncate">{product.seller?.fullName || 'Unknown'}</div>
                            </div>
                        </div>

                        {/* Distance Display */}
                        {product.seller?.lat && product.seller?.lng && (
                            <div className="flex justify-center mb-6">
                                <DistanceDisplay
                                    targetLat={parseFloat(product.seller.lat)}
                                    targetLng={parseFloat(product.seller.lng)}
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-wrap">
                            <Button onClick={handleCallFarmer} variant="outline" className="flex-1">
                                📞 Call Farmer
                            </Button>
                            <Button onClick={handleVisitFarm} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                                📍 Visit Farm
                            </Button>

                            {/* Delete Button for Seller only (Admin uses Admin Dashboard) */}
                            {user && product && user._id === product.seller._id && (
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting..." : "🗑️ Delete Product"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-4">Reviews</h3>

                    {/* Review Form */}
                    <form onSubmit={submitReview} className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Write a Review</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">Rating</label>
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    className="w-full p-2 rounded border border-gray-300 dark:bg-gray-800 rounded-md"
                                >
                                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                </select>
                            </div>
                            <Input
                                placeholder="Review Title"
                                value={reviewTitle}
                                onChange={e => setReviewTitle(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Your experience..."
                                className="w-full p-2 rounded-md border border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
                                rows={3}
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                            />
                            <Button type="submit" isLoading={submittingReview} size="sm">
                                Submit Review
                            </Button>
                        </div>
                    </form>

                    {/* Review List */}
                    <div className="space-y-4">
                        {product.reviews && product.reviews.length > 0 ? (
                            product.reviews.map(review => (
                                <div key={review._id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="font-semibold text-sm">{review.title}</div>
                                        <div className="text-yellow-500 text-xs">{'★'.repeat(review.rating)}</div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{review.text}</p>
                                    <div className="text-xs text-gray-400 mt-2">- {review.user?.fullName || 'Anonymous'}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-4">No reviews yet. Be the first!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
