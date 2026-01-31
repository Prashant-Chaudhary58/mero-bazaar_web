import Link from "next/link";

interface Product {
    id: string;
    name: string;
    price: number;
    rating: number;
    image: string;
    unit?: string;
}

const dummyProducts: Product[] = [
    { id: "1", name: "Maize", price: 10, rating: 3.8, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=500" },
    { id: "2", name: "cabbage", price: 80, rating: 4.0, image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=500" },
    { id: "3", name: "Potatoe", price: 10, rating: 3.8, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=500" },
    { id: "4", name: "Brinjal", price: 80, rating: 4.0, image: "https://images.unsplash.com/photo-1664993306785-5b87c71d3c01?auto=format&fit=crop&q=80&w=500" },
];

export default function ProductSection() {
    return (
        <div className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {dummyProducts.map((product) => (
                    <Link href={`/products/${product.id}`} key={product.id} className="group cursor-pointer">
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 relative">
                            {/* Wishlist Heart */}
                            <div className="absolute top-2 left-2 z-10">
                                <div className="bg-white/80 p-1.5 rounded-full text-green-700">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                </div>
                            </div>

                            <div className="h-40 md:h-48 w-full relative bg-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 text-lg capitalize">{product.name}</h3>
                                <div className="flex items-center text-xs text-yellow-500 mb-1">
                                    <span>★</span>
                                    <span className="ml-1 text-gray-600">{product.rating}</span>
                                </div>
                                <p className="text-gray-900 font-medium">Rs. {product.price}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
