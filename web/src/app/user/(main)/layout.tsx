"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/user/BottomNav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/user/login");
    }
  }, [user, initializing]);

  if (initializing || !user) {
    return (
      <div className="min-h-screen bg-[#F8F8FC] flex items-center justify-center">
        <div className="w-6 h-6 border-[3px] border-gray-200 border-t-[#25207E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
