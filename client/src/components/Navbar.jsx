import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Globe,
  Library,
  LogOut,
  User,
  Menu, // Hamburger icon
  X, // Close icon
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State to control mobile menu open/close
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Helper to check if a link is active (for styling)
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
            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2"
              onClick={handleLinkClick}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                {/* T for Tracker.io */}
                <span className="text-black font-bold text-sm">T</span>
              </div>
              <span className="font-semibold text-white tracking-tight text-lg">
                Tracker.io
              </span>
            </Link>

            {/* DESKTOP NAV (Hidden on Mobile) */}
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

              <Link
                to="/library"
                className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${isActive(
                  "/library"
                )}`}
              >
                <Library className="w-4 h-4" />
                My Library
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: User Profile & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-[#c9d1d9]">{user?.username}</span>
              <div className="h-8 w-8 rounded-full border border-[#30363d] overflow-hidden bg-[#0d1117]">
                {user?.avatar ? (
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

            {/* Desktop Logout (Hidden on Mobile) */}
            <button
              onClick={handleLogout}
              className="hidden md:block text-[#8b949e] hover:text-red-400 transition-colors p-2 rounded-md hover:bg-[#21262d]"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* MOBILE MENU TOGGLE BUTTON */}
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
              className={`block px-3 py-2 rounded-md text-base font-medium items-center gap-2 ${isActive(
                "/dashboard"
              )}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>

            <Link
              to="/explore"
              onClick={handleLinkClick}
              className={` px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${isActive(
                "/explore"
              )}`}
            >
              <Globe className="w-5 h-5" />
              Explore
            </Link>

            <Link
              to="/library"
              onClick={handleLinkClick}
              className={` px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${isActive(
                "/library"
              )}`}
            >
              <Library className="w-5 h-5" />
              My Library
            </Link>

            {/* Mobile User Info & Logout */}
            <div className="mt-4 pt-4 border-t border-[#30363d]">
              <div className="flex items-center px-3 mb-3">
                <div className="shrink-0">
                  {user?.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full border border-[#30363d]"
                      src={user.avatar}
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#0d1117] flex items-center justify-center border border-[#30363d]">
                      <User className="text-[#8b949e] w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">
                    {user?.username}
                  </div>
                  <div className="text-sm font-medium leading-none text-[#8b949e] mt-1">
                    {user?.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-[#8b949e] hover:text-red-400 hover:bg-[#21262d] flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
