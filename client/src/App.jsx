import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";

// critical UI
import Navbar from "./components/Navbar";
import { ChunkErrorBoundary } from "./components/ErrorBoundary";

//const Home       = lazy(() => import('./pages/Home'));
//lazy components
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/DashBoard"));
const Explore = lazy(() => import("./pages/Explore"));
const MyLibrary = lazy(() => import("./pages/MyLibrary"));
const SheetView = lazy(() => import("./pages/SheetView"));

// import AuthLayout from "./components/AuthLayout";

// ── Reusable spinners ────────────────────────────────────────
const FullScreenLoader = () => (
  <div className="h-screen w-full bg-[#0d1117] flex items-center justify-center">
    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
  </div>
);

const PageLoader = () => (
  <div className="h-64 w-full flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

const MainLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Suspense only wraps the page content */}
        <ChunkErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ChunkErrorBoundary>
      </main>
    </div>
  );
};

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const { user } = useAuth();
  const dashboardKey = user?._id ?? "guest";
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
        <Route
          path="/login"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <Register />
            </Suspense>
          }
        />

        {/* All these routes use MainLayout (Navbar + Content) */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard key={dashboardKey} />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/sheet/:sheetId" element={<SheetView />} />

          {/* Protected Routes */}
          <Route
            path="/library"
            element={
              <RequireAuth>
                <MyLibrary />
              </RequireAuth>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
