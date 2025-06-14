import { useBreadcrumbEffect } from "@/context/breadcrumb";

export const DashboardPage = () => {
  useBreadcrumbEffect([
    { title: "General management", href: "/admin" },
    { title: "Dashboard" },
  ]);
  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the admin dashboard. Here you can monitor and get summary of
        your application.
      </p>
    </div>
  );
};
