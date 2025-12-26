"use client"
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterSchema } from "./schema";
import Link from "next/link";

export const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit: SubmitHandler<RegisterSchema> = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Create your account here</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input {...register("fullName")} className="w-full border p-2 rounded-md" placeholder="Enter your full name" />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
        </div>
        
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input {...register("email")} className="w-full border p-2 rounded-md" placeholder="Enter your email" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" {...register("password")} className="w-full border p-2 rounded-md" placeholder="Enter your password" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input type="password" {...register("confirmPassword")} className="w-full border p-2 rounded-md" placeholder="Confirm password" />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message as string}</p>}
        </div>

        <button type="submit" className="w-full bg-[#4B7321] text-white py-2 rounded-md mt-4 hover:bg-opacity-90 transition">
          Register
        </button>
      </form>
      <p className="text-sm mt-4 text-center">
        Already have an account? <Link href="/login" className="text-green-700 font-semibold">Login</Link>
      </p>
    </div>
  );
};