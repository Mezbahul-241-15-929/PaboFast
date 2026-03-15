"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
// Assume signin action exists
// import { signinUser } from "@/app/action/auth/signinUser";

const SignInPage = () => {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false); // For signin page, default to false

  return (
    <div className="min-h-screen flex  justify-center bg-gray-50 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Toggle Buttons */}
        <div className="flex mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsSignup(false)}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 ease-in-out cursor-pointer ${!isSignup
              ? "bg-red-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
          >
            <LogIn className="mr-2 inline h-4 w-4" />
            Sign In
          </button>
          <button
            onClick={() => router.push('/signup')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 ease-in-out cursor-pointer ${isSignup
              ? "bg-red-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
          >
            <UserPlus className="mr-2 inline h-4 w-4" />
            Sign Up
          </button>
        </div>

        {/* Form */}
        <SigninForm />
      </div>
    </div>
  );
};

const SigninForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    // Placeholder for signin logic
    toast.success("Signin successful 🎉");
    reset();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
        Sign in to your account
      </h2>

      <p className="text-center text-gray-500 text-sm mb-6">
        Enter your email and password to sign in
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="asdf@gmail.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 hover:border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400 outline-none transition"
            {...register("email", { required: true })}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 hover:border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400 outline-none transition"
              {...register("password", { required: true })}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2.5 rounded-md font-medium hover:bg-red-600 transition cursor-pointer"
        >
          Sign In
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-grow border-t text-gray-400"></div>
        <span className="mx-3 text-xs text-gray-400 uppercase">Or continue with</span>
        <div className="flex-grow border-t text-gray-400"></div>
      </div>

      {/* Google */}
      <button className="w-full border border-gray-300 rounded-md py-2 flex items-center justify-center gap-2 hover:border-red-400 hover:bg-gray-50 cursor-pointer transition">
        <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={16} height={16} />
        Google
      </button>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-red-500 hover:underline cursor-pointer">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;