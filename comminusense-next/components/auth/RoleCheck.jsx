"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function RequireRole({ children }) {
  const { user, roles, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if we're already on the role selection page
    if (pathname === "/select-role" || pathname === "/login") return;
    
    // If user is authenticated but has no role, redirect to role selection
    if (user && !loading && roles.length === 0) {
      router.push("/select-role");
    }
  }, [user, roles, loading, router, pathname]);

  // Show loading spinner while checking auth and roles
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user needs to select a role
  if (user && roles.length === 0 && pathname !== "/select-role") {
    return null;
  }

  return children;
}

export default RequireRole;