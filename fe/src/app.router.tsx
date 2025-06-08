import { AdminLayout } from "@/app-admin/AdminLayout";
import { DashboardPage } from "@/app-admin/dashboard";
import { UsersPage } from "@/app-admin/users/user-list";
import ForgotPasswordPage from "@/components/custom/forgot-password-page";
import LoginPage from "@/components/custom/login-page";
import NotFoundPage from "@/components/custom/not-found-page";
import ResetPasswordPage from "@/components/custom/reset-password-page";
import { createBrowserRouter, Navigate } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/admin",
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
          { path: "songs", element: <div>Songs</div> },
          { path: "albums", element: <div>Albums</div> },
        ],
      },
    ],
  },
  { path: "/login", Component: LoginPage },
  {
    path: "/reset-password/:resetToken",
    Component: ResetPasswordPage,
  },
  { path: "/forgot-password", Component: ForgotPasswordPage },
  { path: "*", Component: NotFoundPage },
]);
