"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initializing, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/login");
    }
  }, [user, initializing, router]);

  if (initializing || !user) {
    return (
      <div className="min-h-screen bg-[#F8F8FC] dark:bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-[3px] border-gray-200 dark:border-gray-700 border-t-[#25207E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar onLogout={logout} />
      <div className="flex-1 ml-[250px] flex flex-col">
        <Topbar userName={user.nombre} />
        <main className="flex-1 pt-[72px]">{children}</main>
      </div>
    </div>
  );
}
