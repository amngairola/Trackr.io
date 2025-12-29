import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import Explore from "./pages/Explore";

import MyLibrary from "./pages/MyLibrary";

import SheetView from "./pages/SheetView";

import Navbar from "./components/Navbar";

import AuthLayout from "./components/AuthLayout";

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0d1117] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#161b22",
            color: "#c9d1d9",
            border: "1px solid #30363d",
          },
          success: {
            iconTheme: {
              primary: "#238636",
              secondary: "#ffffff",
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/explore" element={<Explore />} />
          <Route path="/library" element={<MyLibrary />} />

          <Route path="/sheet/:sheetId" element={<SheetView />} />
        </Route>

        {/* Fallback Route (404) */}
        <Route
          path="*"
          element={
            <AuthLayout authentication={true}>
              <Dashboard />
            </AuthLayout>
          }
        />
      </Routes>
    </>
  );
};

export default App;
