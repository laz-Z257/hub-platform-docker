"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const hasAuth = document.cookie.includes("auth-token");
    if (!hasAuth) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "250px", display: "flex", flexDirection: "column" }}>
        <Topbar />
        <main style={{ flex: 1, paddingTop: "70px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
