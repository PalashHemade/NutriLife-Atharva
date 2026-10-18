"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const dashboardMap: Record<string, string> = {
  user: "/dashboard/user",
  consultant: "/dashboard/consultant",
  trainer: "/dashboard/trainer",
  admin: "/dashboard/admin",
};

export default function DashboardIndexPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role || "user";
      router.replace(dashboardMap[role] || "/dashboard/user");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, session, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#64748B", fontSize: 14 }}>Redirecting...</p>
    </div>
  );
}
