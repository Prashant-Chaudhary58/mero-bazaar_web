"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "./schema";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Get role from URL (?role=seller or ?role=buyer)
  useEffect(() => {
    const roleFromUrl = searchParams.get("role");
    if (roleFromUrl && ["seller", "buyer"].includes(roleFromUrl)) {
      setSelectedRole(roleFromUrl);
    } else {
      // Redirect back to role selection if no/invalid role
      router.replace("/select-role");
    }
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: RegisterInput) => {
    if (!selectedRole) {
      setServerError("Please select a role first.");
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch(
        "http://localhost:5001/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fullName: data.fullName,
            phone: data.phone,
            password: data.password,
            role: selectedRole, 
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setServerError(
          result.error || "Registration failed. Please try again.",
        );
        return;
      }

      // Success! 
      toast.success(
        `Welcome, ${data.fullName}! 🎉 Your account has been created as a ${selectedRole === "seller" ? "Seller" : "Buyer"}.`,
        {
          duration: 5000,
          position: "top-center",
        },
      );

      console.log("Registration successful:", result);
      router.push("/dashboard");
    } catch (err) {
      setServerError("Something went wrong. Please check your internet.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedRole) {
    return <div className="text-center p-8">Loading role...</div>;
  }

  return (
    <div className="w-full max-w-md p-4">
      <h2 className="text-2xl font-bold mb-2 text-black">
        Sign up as {selectedRole === "seller" ? "Seller (Farmer)" : "Buyer"}
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {selectedRole === "seller"
          ? "List your fresh produce directly to buyers"
          : "Get fresh vegetables and fruits at fair prices"}
      </p>

      {serverError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-1 text-black">
          <label className="text-sm font-medium text-black">Full Name</label>
          <input
            {...register("fullName")}
            className={`border rounded-md p-2 outline-none transition w-full text-black ${errors.fullName
              ? "border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-gray-300 focus:border-green-500 "
              }`}
            placeholder="Ram Bahadur Thapa"
          />
          {errors.fullName && (
            <span className="text-xs text-red-500 font-medium">
              {errors.fullName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-black">
            Phone Number
          </label>
          <input
            {...register("phone")}
            type="tel"
            className={`border rounded-md p-2 outline-none transition w-full text-gray-900 ${errors.phone
              ? "border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-gray-300 focus:border-green-500"
              }`}
            placeholder="98XXXXXXXX"
          />
          {errors.phone && (
            <span className="text-xs text-red-500 font-medium">
              {errors.phone.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-black">Password</label>
          <input
            {...register("password")}
            type="password"
            className={`border rounded-md p-2 outline-none transition w-full text-gray-900 ${errors.password
              ? "border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-gray-300 focus:border-green-500"
              }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <span className="text-xs text-red-500 font-medium">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-black">
            Confirm Password
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            className={`border rounded-md p-2 outline-none transition w-full text-gray-900 ${errors.confirmPassword
              ? "border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-gray-300 focus:border-green-500"
              }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <span className="text-xs text-red-500 font-medium">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="accent-[#4B7321]"
          />
          <label
            htmlFor="terms"
            className="text-xs text-gray-600 cursor-pointer"
          >
            I accept all the{" "}
            <span className="text-[#4B7321] underline">
              terms and conditions
            </span>
            .
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2.5 rounded-md font-semibold text-white transition-colors ${isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#4B7321] hover:bg-[#3d5d1a]"
            }`}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#4B7321] font-bold hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
};
