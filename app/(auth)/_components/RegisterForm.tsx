"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterInput } from "./schema";

export const RegisterForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched", 
  });

  const onSubmit = (data: RegisterInput) => {
    console.log("Form Submitted Successfully:", data);
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign up</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            {...register("fullName")}
            className={`border rounded-md p-2 outline-none transition ${
              errors.fullName ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-green-500"
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <span className="text-xs text-red-500 font-medium">{errors.fullName.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            {...register("email")}
            type="email"
            className={`border rounded-md p-2 outline-none transition ${
              errors.email ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-green-500"
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            {...register("password")}
            type="password"
            className={`border rounded-md p-2 outline-none transition ${
              errors.password ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-green-500"
            }`}
            placeholder="Enter password"
          />
          {errors.password && (
            <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            {...register("confirmPassword")}
            type="password"
            className={`border rounded-md p-2 outline-none transition ${
              errors.confirmPassword ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-green-500"
            }`}
            placeholder="Confirm password"
          />
          {errors.confirmPassword && (
            <span className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</span>
          )}
        </div>

        <div className="flex items-center gap-2 py-2">
          <input type="checkbox" id="terms" required className="accent-[#4B7321]" />
          <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
            I accept all the terms and conditions.
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-[#4B7321] text-white py-2.5 rounded-md font-semibold hover:bg-[#3d5d1a] transition-colors"
        >
          Register
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-[#4B7321] font-bold hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};