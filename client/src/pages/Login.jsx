import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom"; // Removed Link
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import app_icon from "../assets/app_icon.png";
import { GoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import api from "../context/axios";

export const Login = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Legacy Email Login (For existing users only)
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Handles Both Sign Up & Login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const response = await api.post("/google", {
        googleToken: credentialResponse.credential,
      });

      const { user, accessToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      setUser(user);
      navigate("/dashboard");
      toast.success("Successfully logged in!");
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("Google Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  useGoogleOneTapLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => console.log("One Tap Failed"),
  });

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4 font-sans text-[#c9d1d9]">
      {/* 1. Header */}
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
          <img src={app_icon} className="rounded-2xl" alt="Logo" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Tracker.io
        </h1>
        <p className="text-[#8b949e]">
          The best way to track your DSA progress.
        </p>
      </div>

      {/* 2. Main Card */}
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-2xl">
        {/* Primary Action: Google Login */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-white text-center">
            New here? Join with Google.
          </h2>
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Login Failed")}
              theme="filled_black"
              shape="rect"
              width="300"
              text="continue_with"
              auto_select={true}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 flex items-center w-full">
          <div className="flex-1 border-t border-[#30363d]"></div>
          <span className="px-3 text-xs text-[#8b949e] font-medium uppercase tracking-wider">
            Existing Users
          </span>
          <div className="flex-1 border-t border-[#30363d]"></div>
        </div>

        {/* Secondary Action: Email Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <input
              type="email"
              placeholder="Email address"
              {...register("email", { required: "Email is required" })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-[#484f58]"
            />
            {errors.email && (
              <p className="text-red-400 text-xs pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: "Password is required" })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-[#484f58]"
            />
            {errors.password && (
              <p className="text-red-400 text-xs pl-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Sign in with Password"
            )}
          </button>
        </form>
      </div>

      {/* 3. Footer Note */}
      <p className="mt-6 text-xs text-[#8b949e] text-center max-w-xs">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};

export default Login;
