import { AdminLayout } from "@/app-admin/AdminLayout";
import { DashboardPage } from "@/app-admin/dashboard";
import { UsersPage } from "@/app-admin/users/user-list";
import { createBrowserRouter, Navigate } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      { path: "dashboard", Component: DashboardPage },
      { path: "users", Component: UsersPage },
      { path: "songs", element: <div>Songs</div> },
      { path: "albums", element: <div>Albums</div> },
    ],
  },
]);
