"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "./schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const LoginForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        mode: "onTouched",
    });

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        setServerError(null);

        try {
            const response = await fetch("http://localhost:5001/api/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // ← Crucial for sending/receiving HttpOnly cookie
                body: JSON.stringify({
                    phone: data.phone,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                // backend errors like "Invalid credentials"
                setServerError(result.error || "Login failed. Please try again.");
                return;
            }
            // Success!
            toast.success(`Welcome back! You're now logged in. 🌱`, {
                duration: 4000,
            });

            // Success → cookie is automatically set by browser
            console.log("Login successful:", result);

            // Store user in localStorage for frontend state
            if (result.data) {
                localStorage.setItem('user', JSON.stringify(result.data));
            }

            router.push("/"); // Redirect to Dashboard at root
        } catch (err) {
            setServerError("Something went wrong. Please check your connection.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Welcome Back</h2>

            {serverError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <input
                        {...register("phone")}
                        type="tel"
                        className={`border rounded-md p-2.5 outline-none transition w-full text-black ${errors.phone
                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-gray-300 focus:border-[#4B7321]"
                            }`}
                        placeholder="98XXXXXXXX"
                    />
                    {errors.phone && (
                        <span className="text-xs text-red-500 font-medium mt-1">
                            {errors.phone.message}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        {...register("password")}
                        className={`border rounded-md p-2.5 outline-none transition w-full text-black ${errors.password
                            ? "border-red-500 focus:ring-1 focus:ring-red-500"
                            : "border-gray-300 focus:border-[#4B7321]"
                            }`}
                        placeholder="••••••••"
                    />
                    {errors.password && (
                        <span className="text-xs text-red-500 font-medium mt-1">
                            {errors.password.message}
                        </span>
                    )}

                    <div className="text-right mt-1">
                        <Link
                            href="/auth/forgot-password" // Updated route
                            className="text-xs text-[#4B7321] hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2.5 rounded-md font-semibold text-white transition-colors mt-2 ${isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#4B7321] hover:bg-[#3d5d1a]"
                        }`}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                    href="/auth/register" // Updated route
                    className="text-[#4B7321] font-semibold hover:underline"
                >
                    Sign Up
                </Link>
            </p>
        </div>
    );
};
