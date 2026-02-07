import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

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
        name: string;
        _id: string;
        farmName?: string;
    };
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const router = useRouter();


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700">
            <div className="relative h-48 w-full bg-gray-200">
                <img
                    src={product.image ? `http://localhost:5001/uploads/products/${product.image}` : "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                />
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 px-2 py-1 rounded-md text-xs font-bold text-primary shadow-sm">
                    {product.category}
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1" title={product.name}>
                        {product.name}
                    </h3>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                        Rs. {product.price}
                    </span>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-grow">
                    {product.description}
                </p>

                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4 space-x-2">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Qty: {product.quantity}
                    </span>
                    <span className="flex items-center text-yellow-500">
                        ★ {product.averageRating.toFixed(1)} ({product.numOfReviews})
                    </span>
                </div>

                <div className="mt-auto">
                    <Button
                        className="w-full"
                        variant="primary"
                        onClick={() => router.push(`/products/${product._id}`)}
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
