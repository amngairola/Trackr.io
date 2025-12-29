import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import app_icon from "../assets/app_icon.png";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      const message =
        error.response?.data?.message || "Invalid email or password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4 font-sans text-[#c9d1d9]">
      {/* 1. Logo Section */}
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center mb-4">
          <img src={app_icon} className="rounded-2xl" alt="Logo" />
        </div>
        <h1 className="text-2xl font-light tracking-tight text-white">
          Sign in to Tracker.io
        </h1>
      </div>

      {/* 2. Login Form Card */}
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-md p-5 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Email address
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-white">
                Password
              </label>
              {/* Optional: Add Forgot Password link later */}
              {/* <span className="text-xs text-[#58a6ff] cursor-pointer hover:underline">
                Forgot password?
              </span> */}
            </div>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>

      {/* 3. Footer / Register Link */}
      <div className="mt-4 p-4 text-sm text-center border border-[#30363d] rounded-md w-full max-w-sm">
        <span className="text-[#c9d1d9]">New to Tracker.io? </span>
        <Link to="/register" className="text-[#58a6ff] hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
