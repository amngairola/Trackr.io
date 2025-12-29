import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import api from "../context/axios";
import app_icon from "../assets/app_icon.png";
import { toast } from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // New States for OTP Logic
  const [isOtpSent, setIsOtpSent] = useState(false); // Tracks if OTP was sent
  const [otp, setOtp] = useState(""); // Stores user's OTP input
  const [isVerified, setIsVerified] = useState(false); // Tracks success
  const { user, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    watch, // Needed to watch email field value
    trigger, // Needed to validate form manually
    formState: { errors },
  } = useForm();

  const emailValue = watch("email");

  // STEP 1: Register User & Send OTP
  const onRegisterSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (data.adminKey) formData.append("adminKey", data.adminKey);
      if (data.avatar && data.avatar[0])
        formData.append("avatar", data.avatar[0]);

      // Call Register API (This sends the email in your backend logic)
      await api.post("/register", formData);

      // If successful, show OTP field
      setIsOtpSent(true);

      toast.success(
        "OTP sent! Please check your email (including spam folder)."
      );
    } catch (error) {
      console.error("Registration failed:", error);
      setServerError(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify the OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return;
    setIsLoading(true);
    try {
      const response = await api.post("/verify-otp", {
        email: emailValue,
        otp: otp,
      });

      setIsVerified(true);

      const { user, accessToken } = response.data.data;
      setUser(user);
      localStorage.setItem("accessToken", accessToken);
      // Optional: Auto-login or redirect after a delay
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      setServerError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4 font-sans text-[#c9d1d9]">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center mb-4">
          <img src={app_icon} className="rounded-2xl" alt="Logo" />
        </div>
        <h1 className="text-2xl font-light tracking-tight text-white">
          Sign up to Tracker.io
        </h1>
      </div>

      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-md p-5 shadow-sm">
        {serverError && (
          <div className="mb-4 p-3 rounded-md bg-red-900/30 border border-red-800 text-red-200 text-sm">
            {serverError}
          </div>
        )}

        {/* We use handleSubmit only for the initial registration step.
            Once OTP is sent, we disable the main form submission to prevent duplicates.
        */}
        <form
          onSubmit={
            !isOtpSent
              ? handleSubmit(onRegisterSubmit)
              : (e) => e.preventDefault()
          }
          className="space-y-4"
        >
          {/* Username */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Username
            </label>
            <input
              {...register("username", { required: "Username is required" })}
              disabled={isOtpSent} // Disable after sending OTP
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email Section */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Email address
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              disabled={isOtpSent}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}

            {/* --- THE VERIFY LINK LOGIC --- */}
            {!isOtpSent && !isVerified && (
              <div className="flex justify-end pt-1">
                <button
                  type="submit" // Triggers handleSubmit(onRegisterSubmit)
                  className={`text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3 h-3" />
                  )}
                  Verify Email
                </button>
              </div>
            )}
            {/* --------------------------- */}
          </div>

          {/* OTP INPUT SECTION (Appears after clicking Verify) */}
          {isOtpSent && !isVerified && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-[#1c2128] p-3 rounded-md border border-blue-500/30">
              <label className="block text-xs font-medium text-blue-400 mb-2">
                Enter OTP sent to {emailValue}
              </label>
              <div className="flex gap-2">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:border-green-500 outline-none tracking-widest text-center"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length < 6}
                  className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isVerified && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Email Verified! Redirecting...</span>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 chars" },
              })}
              disabled={isOtpSent}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Admin Key */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white flex justify-between">
              Admin Key{" "}
              <span className="text-[#8b949e] font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              {...register("adminKey")}
              disabled={isOtpSent}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              {...register("avatar", {
                required: "Profile picture is required",
              })}
              disabled={isOtpSent}
              className="w-full text-sm text-[#8b949e] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#30363d] file:text-white hover:file:bg-[#282e33] cursor-pointer disabled:opacity-50"
            />
            {errors.avatar && (
              <p className="text-red-400 text-xs mt-1">
                {errors.avatar.message}
              </p>
            )}
          </div>

          {/* Hide Main Submit Button if OTP process started (optional, as the Verify link triggered it) */}
          {!isOtpSent && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          )}
        </form>
      </div>

      <div className="mt-4 p-4 text-sm text-center border border-[#30363d] rounded-md w-full max-w-sm">
        <span className="text-[#c9d1d9]">Already have an account? </span>
        <Link to="/login" className="text-[#58a6ff] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
