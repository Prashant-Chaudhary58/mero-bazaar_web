"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const products = {
    "1": { name: "Maize", price: 10, rating: 3.8, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800", description: "Fresh farm maize directly from the fields." },
    "2": { name: "cabbage", price: 80, rating: 4.0, image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800", description: "Premium quality cabbage grown with care." },
    "3": { name: "Potatoe", price: 10, rating: 3.8, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800", description: "Starchy and delicious organic potatoes." },
    "4": { name: "Brinjal", price: 80, rating: 4.0, image: "https://images.unsplash.com/photo-1664993306785-5b87c71d3c01?auto=format&fit=crop&q=80&w=800", description: "Fresh purple brinjal suitable for curries." },
};

export default function ProductDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [quantity, setQuantity] = useState(20);

    const product = products[id as keyof typeof products] || products["1"];

    // Dummy fallback if ID not found, usually 404
    if (!products[id as keyof typeof products] && id) {
        // handle not found
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header matching design details */}
            <div className="flex items-center p-4 border-b sticky top-0 bg-white z-10">
                <button onClick={() => router.back()} className="mr-4 text-green-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <h1 className="text-xl font-bold text-black">Product details</h1>
            </div>

            <div className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-2 gap-8">
                {/* Image */}
                <div className="aspect-square w-full relative rounded-lg overflow-hidden bg-gray-100">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Details */}
                <div className="flex flex-col">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">ताजा नेपाली {product.name} 🥭</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                            प्रजाति: मालदह, दशहरी, कलकत्ते, बम्बै, सिन्धु, अल्फान्सो विशेषता: बारीबाट सिधै, पूर्ण पाकेको, रसिलो-मीठो, सुगन्धित, 200-600 ग्राम, कम रासायनिक, जैविक स्वाद गर्मीयामको राजा – एक टोकाइसमै स्वर्ग!
                            {/* Using the text from the screenshot for authenticity */}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-gray-900">Rs. {product.price}/kg</span>

                        <div className="flex items-center gap-4">
                            <button
                                className="w-8 h-8 rounded-full bg-[#4B7321] text-white flex items-center justify-center font-bold"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </button>
                            <span className="text-gray-900 font-medium w-6 text-center">{quantity}</span>
                            <button
                                className="w-8 h-8 rounded-full bg-[#4B7321] text-white flex items-center justify-center font-bold"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center text-yellow-500 mb-6">
                        <span>★</span>
                        <span className="ml-1 text-gray-800 font-medium">{product.rating}</span>
                    </div>

                    <div className="mb-8">
                        <span className="bg-green-100 text-[#4B7321] px-3 py-1 rounded-full text-xs font-bold flex items-center w-max gap-1">
                            ✓ 100% Eco-Friendly
                        </span>
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <button className="flex-1 py-3 border border-[#4B7321] text-[#4B7321] rounded-lg font-medium hover:bg-green-50 transition">
                            Visit Farm
                        </button>
                        <button className="flex-1 py-3 bg-[#4B7321] text-white rounded-lg font-medium hover:bg-green-800 transition">
                            Contact Farmer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
