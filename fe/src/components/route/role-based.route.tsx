import { useAuth } from "@/context/auth";
import { Navigate, Outlet } from "react-router";

interface RoleBasedRouteProps {
  allowedRoles: string[];
  redirectPath?: string;
}

export const RoleBasedRoute = ({
  allowedRoles,
  redirectPath = "/not-found",
}: RoleBasedRouteProps) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};
