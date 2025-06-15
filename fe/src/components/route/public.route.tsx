import { useAuth } from "@/context/auth";
import { Navigate, Outlet } from "react-router";

export const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};