import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Sparkles } from "lucide-react";

export function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground animate-pulse mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Initializing Life OS session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground animate-pulse mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
