import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Globe,
  Library,
  LogOut,
  User,
  Menu,
  X,
  LogIn,
} from "lucide-react";
import app_icon from "../assets/app_icon.png";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("You have successfully logged out.");
    navigate("/");
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "text-white font-semibold bg-[#21262d]"
      : "text-[#c9d1d9] hover:text-white hover:bg-[#21262d]";
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#161b22] border-b border-[#30363d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT SIDE: Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2"
              onClick={handleLinkClick}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <img src={app_icon} className="rounded-2xl" alt="Logo" />
              </div>
              <span className="font-semibold text-white tracking-tight text-lg">
                Tracker.io
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${isActive(
                  "/dashboard"
                )}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/explore"
                className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${isActive(
                  "/explore"
                )}`}
              >
                <Globe className="w-4 h-4" />
                Explore
              </Link>

              {/* Only show Library if logged in */}
              {user && (
                <Link
                  to="/library"
                  className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${isActive(
                    "/library"
                  )}`}
                >
                  <Library className="w-4 h-4" />
                  My Library
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Auth Buttons */}
          <div className="flex items-center gap-4">
            {/* 🟢 SCENARIO 1: USER IS LOGGED IN */}
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-sm text-[#c9d1d9]">
                    {user.username}
                  </span>
                  <div className="h-8 w-8 rounded-full border border-[#30363d] overflow-hidden bg-[#0d1117]">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#8b949e]">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="hidden md:block text-[#8b949e] hover:text-red-400 transition-colors p-2 rounded-md hover:bg-[#21262d]"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              /* 🔴 SCENARIO 2: GUEST (Show Sign In Button) */
              <div className="hidden md:block">
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-1.5 rounded-md font-medium text-sm transition-colors shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#c9d1d9] hover:text-white p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#161b22] border-t border-[#30363d]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              onClick={handleLinkClick}
              className={`flex px-3 py-2 rounded-md text-base font-medium items-center gap-2 ${isActive(
                "/dashboard"
              )}`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <Link
              to="/explore"
              onClick={handleLinkClick}
              className={`flex px-3 py-2 rounded-md text-base font-medium items-center gap-2 ${isActive(
                "/explore"
              )}`}
            >
              <Globe className="w-5 h-5" /> Explore
            </Link>

            {user && (
              <Link
                to="/library"
                onClick={handleLinkClick}
                className={`flex px-3 py-2 rounded-md text-base font-medium items-center gap-2 ${isActive(
                  "/library"
                )}`}
              >
                <Library className="w-5 h-5" /> My Library
              </Link>
            )}

            <div className="mt-4 pt-4 border-t border-[#30363d]">
              {user ? (
                // Mobile Logged In View
                <>
                  <div className="flex items-center px-3 mb-3">
                    <div className="shrink-0">
                      {user.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatar}
                          alt=""
                        />
                      ) : (
                        <User className="text-[#8b949e] w-6 h-6" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">
                        {user.username}
                      </div>
                      <div className="text-sm font-medium text-[#8b949e]">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-[#8b949e] hover:text-red-400 hover:bg-[#21262d] flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" /> Sign out
                  </button>
                </>
              ) : (
                // Mobile Guest View
                <div className="px-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#238636] text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
