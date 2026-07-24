import { ReactNode } from "react";
import { Link, Navigate } from "react-router";
import { useAuthStore } from "@/store/auth.store";
import { Role } from "@/types";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="mb-4">Sign in to view this page.</p>
        <Button asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
