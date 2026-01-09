"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      // Not authenticated, redirect to login
      router.push("/auth");
      return;
    }

    // Authenticated, redirect based on role
    if (session.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Show loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    </div>
  );
}
