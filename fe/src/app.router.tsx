import { AdminLayout } from "@/app-admin/AdminLayout";
import { DashboardPage } from "@/app-admin/dashboard";
import UserDetailPage from "@/app-admin/users/user-detail";
import { UsersPage } from "@/app-admin/users/user-list";
import ForgotPasswordPage from "@/components/custom/forgot-password-page";
import LoginPage from "@/components/custom/login-page";
import NotFoundPage from "@/components/custom/not-found-page";
import ResetPasswordPage from "@/components/custom/reset-password-page";
import { ProtectedRoute } from "@/components/route/protected.route";
import { PublicRoute } from "@/components/route/public.route";
import { RoleBasedRoute } from "@/components/route/role-based.route";
import { createBrowserRouter, Navigate } from "react-router";

export const router = createBrowserRouter([
  // Public routes that redirect authenticated users
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", Component: LoginPage },
      { path: "/forgot-password", Component: ForgotPasswordPage },
      { path: "/reset-password/:resetToken", Component: ResetPasswordPage },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      // Admin routes - require ADMIN role
      {
        path: "/admin",
        element: <RoleBasedRoute allowedRoles={["ADMIN"]} />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "",
            Component: AdminLayout,
            children: [
              { path: "dashboard", Component: DashboardPage },
              { path: "users", Component: UsersPage },
              { path: "users/:userId", Component: UserDetailPage },
              { path: "songs", element: <div>Songs</div> },
              { path: "albums", element: <div>Albums</div> },
            ],
          },
        ],
      },

      // Regular user routes could go here
      {
        path: "/",
        element: <div>User Home</div>,
      },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);
