import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../context/axios";
import app_icon from "../assets/app_icon.png";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onRegisterSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (data.adminKey) formData.append("adminKey", data.adminKey);
      if (data.avatar && data.avatar[0]) {
        formData.append("avatar", data.avatar[0]);
      }

      // Call Register API
      await api.post("/register", formData);

      toast.success("Account created successfully!");

      // Redirect to login page immediately
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      setServerError(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  //google login
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
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("Google Login failed");
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

        <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Username
            </label>
            <input
              {...register("username", { required: "Username is required" })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full text-sm text-[#8b949e] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#30363d] file:text-white hover:file:bg-[#282e33] cursor-pointer transition-colors"
            />
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
            className="w-full mt-4 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>

      <div className="mt-4 p-4 text-sm text-center border border-[#30363d] rounded-md w-full max-w-sm">
        <span className="text-[#c9d1d9]">Already have an account? </span>
        <Link to="/login" className="text-[#58a6ff] hover:underline">
          Sign in
        </Link>
      </div>

      <div className="my-4 flex items-center">
        <div className="flex-1 border-t border-gray-700"></div>
        <span className="px-3 text-gray-500 text-sm">OR</span>
        <div className="flex-1 border-t border-gray-700"></div>
      </div>

      {/* GOOGLE BUTTON */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log("Login Failed")}
          theme="filled_black"
          shape="pill"
        />
      </div>
    </div>
  );
};

export default Register;
