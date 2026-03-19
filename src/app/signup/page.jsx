"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { signupUser } from "@/app/action/auth/signupUser";

const SignUpPage = () => {
    const router = useRouter();
    const [isSignup, setIsSignup] = useState(true);

    return (
        <div className="min-h-screen flex justify-center bg-gray-50 px-4 py-8 sm:py-12">
            <div className="w-full max-w-md">

                <div className="flex mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => router.push('/signin')}
                        className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 cursor-pointer ${
                            !isSignup
                                ? "bg-red-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        }`}
                    >
                        <LogIn className="mr-2 inline h-4 w-4" />
                        Sign In
                    </button>

                    <button
                        onClick={() => setIsSignup(true)}
                        className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-300 cursor-pointer ${
                            isSignup
                                ? "bg-red-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                        }`}
                    >
                        <UserPlus className="mr-2 inline h-4 w-4" />
                        Sign Up
                    </button>
                </div>

                <SignupForm />
            </div>
        </div>
    );
};

const SignupForm = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            password: "",
        },
    });

    const agree = watch("agree");

    const onSubmit = async (data) => {

        const newUser = {
            name: data.fullName,
            email: data.email,
            phone: data.phone,
            password: data.password,
            photo: null,
        };

        const result = await signupUser(newUser);

        if (result?.insertedId) {

            toast.success("Signup successful");

            const signInResult = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            if (signInResult?.ok) {
                router.push("/");
            }

            reset();

        } else {
            toast.error("Signup failed. Email may already exist.");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">

            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">
                Create an account
            </h2>

            <p className="text-center text-gray-500 text-sm mb-6">
                Enter your information to create an account
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Full Name
                    </label>

                    <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 hover:border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400 outline-none transition"
                        {...register("fullName", { required: true })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="asdf@gmail.com"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 hover:border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400 outline-none transition"
                        {...register("email", { required: true })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Phone Number
                    </label>

                    <input
                        type="tel"
                        placeholder="+880 1234 567890"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 hover:border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400 outline-none transition"
                        {...register("phone", { required: true })}
                    />
                </div>

                <div>

                    <label className="block text-sm font-medium mb-1">
                        Password
                    </label>

                    <div className="relative">

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
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

                <div className="flex items-start gap-2 text-sm">

                    <input
                        type="checkbox"
                        className="mt-1 accent-red-500 cursor-pointer"
                        {...register("agree", { required: true })}
                    />

                    <span>
                        I agree to the{" "}
                        <Link href="#" className="text-red-500 hover:underline cursor-pointer">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-red-500 hover:underline cursor-pointer">
                            Privacy Policy
                        </Link>
                    </span>

                </div>

                <button
                    type="submit"
                    disabled={!agree}
                    className="w-full bg-red-500 text-white py-2.5 rounded-md font-medium hover:bg-red-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Create Account
                </button>

            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link
                    href="/signin"
                    className="text-red-500 hover:underline cursor-pointer"
                >
                    Sign in
                </Link>
            </p>

        </div>
    );
};

export default SignUpPage;
