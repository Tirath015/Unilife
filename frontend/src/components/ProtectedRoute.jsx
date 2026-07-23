import React from "react";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from './ui/LoadingState';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingState label="Checking secure session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

