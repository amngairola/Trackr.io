import React, { useState } from "react";
import { useForm } from "react-hook-form"; // 1. Added Missing Import
import { Link, useNavigate } from "react-router-dom"; // 2. Added Link
import { Loader2 } from "lucide-react"; // 3. Added Icon
import api from "../context/axios";
import app_icon from "../assets/app_icon.png";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(""); // Clear previous errors

    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);

      if (data.adminKey) {
        formData.append("adminKey", data.adminKey);
      }

      if (data.avatar && data.avatar[0]) {
        formData.append("avatar", data.avatar[0]);
      }

      const response = await api.post("/register", formData);

      console.log("Registration Success:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);

      setServerError(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4 font-sans text-[#c9d1d9]">
      {/* 1. Logo / Header */}
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-white rounded-full mx-auto flex items-center justify-center mb-4">
          <img src={app_icon} className="rounded-2xl " />
        </div>
        <h1 className="text-2xl font-light tracking-tight text-white">
          Sign up to Tracker.io
        </h1>
      </div>

      {/* 2. The Form Card */}
      <div className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-md p-5 shadow-sm">
        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-4 p-3 rounded-md bg-red-900/30 border border-red-800 text-red-200 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Username
            </label>
            <input
              {...register("username", { required: "Username is required" })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
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
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Admin Key (Optional) */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white flex justify-between">
              Admin Key{" "}
              <span className="text-[#8b949e] font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              {...register("adminKey")}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Profile Picture
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                {...register("avatar", {
                  required: "Profile picture is required",
                })}
                className="w-full text-sm text-[#8b949e] 
                  file:mr-4 file:py-1 file:px-3
                  file:rounded-md file:border-0
                  file:text-xs file:font-semibold
                  file:bg-[#30363d] file:text-white
                  hover:file:bg-[#282e33] cursor-pointer"
              />
            </div>
            {errors.avatar && (
              <p className="text-red-400 text-xs mt-1">
                {errors.avatar.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>

      {/* 3. Footer / Login Link */}
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
