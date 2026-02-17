'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const productSchema = z.object({
    name: z.string().min(3, 'Name is required'),
    description: z.string().min(10, 'Description must be at least 10 chars'),
    price: z.coerce.number().min(1, 'Price must be positive'),
    quantity: z.string().min(1, 'Quantity is required (e.g. 1kg)'),
    category: z.enum(['Vegetables', 'Fruits', 'Grains', 'Others']),
    // Image handled manually
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            quantity: '',
            category: 'Vegetables',
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImage(e.target.files[0]);
        }
    };

    const onSubmit = async (data: ProductFormValues) => {
        if (!image) {
            toast.error("Please upload a product image");
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('price', data.price.toString());
            formData.append('quantity', data.quantity);
            formData.append('category', data.category);
            formData.append('image', image);

            // Backend expects 'image' field for file
            const response = await api.post('/api/v1/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success("Product added successfully!");
                router.push('/seller');
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || "Failed to add product";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex justify-center">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Add New Product</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Product Name"
                        placeholder="e.g. Fresh Tomatoes"
                        {...register('name')}
                        error={errors.name?.message}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            className="w-full p-2 rounded-md border border-gray-300 dark:bg-background focus:ring-2 focus:ring-green-500 outline-none"
                            rows={4}
                            placeholder="Describe your product..."
                            {...register('description')}
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price (Rs.)"
                            type="number"
                            placeholder="50"
                            {...register('price')}
                            error={errors.price?.message}
                        />
                        <Input
                            label="Quantity / Unit"
                            placeholder="e.g. 1 kg"
                            {...register('quantity')}
                            error={errors.quantity?.message}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                            className="w-full p-2 rounded-md border border-gray-300 dark:bg-background outline-none"
                            {...register('category')}
                        >
                            <option value="Vegetables">Vegetables</option>
                            <option value="Fruits">Fruits</option>
                            <option value="Grains">Grains</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading} className="flex-1">Publish Product</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
