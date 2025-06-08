import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  const handleGoHome = () => (window.location.href = "/");
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page not found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleGoHome}>
            <Home className="w-4 h-4" />
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
