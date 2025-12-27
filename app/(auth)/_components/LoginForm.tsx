"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./schema";
import Link from "next/link";

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Welcome to Login!</h2>
      <form onSubmit={handleSubmit((data) => console.log(data))} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input {...register("email")} className="w-full border p-2 rounded-md" placeholder="Enter your email" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" {...register("password")} className="w-full border p-2 rounded-md" placeholder="Enter your password" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
          <div className="text-right mt-1">
             <Link href="#" className="text-xs text-green-700">Forget Password?</Link>
          </div>
        </div>

        <Link href={"/dashboard"}><button type="submit" className="w-full bg-[#4B7321] text-white py-2 rounded-md mt-2 hover:bg-opacity-90">
          Login
        </button>
        </Link>
      </form>
      <p className="text-sm mt-6 text-center">
        Don&apos;t have an account? <Link href="/register" className="text-green-700 font-semibold">Sign Up</Link>
      </p>
    </div>
  );
};