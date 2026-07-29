import { Navigate, Route, Routes } from "react-router-dom";
import React from "react";
import { AdminGuard } from "./admin/AdminGuard";
import { AdminLayout } from "./admin/layout/AdminLayout";
import { AdminListings } from "./admin/pages/AdminListings";
import { AdminOverview } from "./admin/pages/AdminOverview";
import { AdminPrototypes } from "./admin/pages/AdminPrototypes";
import { AdminReports } from "./admin/pages/AdminReports";
import { AdminUsers } from "./admin/pages/AdminUsers";

import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";

import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";
import { NotFound } from "./pages/NotFound";
import { Profile } from "./pages/Profile";

import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { UpdatePassword } from "./pages/auth/UpdatePassword";

import { CreateListing } from "./pages/marketplace/CreateListing";
import { Marketplace } from "./pages/marketplace/Marketplace";
import { ProductDetails } from "./pages/marketplace/ProductDetails";
import { Wishlist } from "./pages/marketplace/Wishlist";

import { Discussions } from "./pages/prototype/Discussions";
import { Events } from "./pages/prototype/Events";
import { Jobs } from "./pages/prototype/Jobs";
import { Notifications } from "./pages/prototype/Notifications";
import { Resources } from "./pages/prototype/Resources";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      

      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="prototypes" element={<AdminPrototypes />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/create" element={<CreateListing />} />
          <Route path="/marketplace/:id" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/events" element={<Events />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/discussions" element={<Discussions />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <AppRoutes />
      </WishlistProvider>
    </AuthProvider>
  );
}
