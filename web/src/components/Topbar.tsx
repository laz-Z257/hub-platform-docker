"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, HelpCircle, UserPlus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

export default function Topbar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isUsers = pathname === "/dashboard/users";
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await api.get<{ count: number }>("/incidents/unread-count");
      setUnreadCount(data.count);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const handleBellClick = useCallback(() => {
    router.push("/dashboard/tickets");
  }, [router]);

  return (
    <header className="fixed top-0 left-[250px] right-0 h-[72px] bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-6 z-30">

      <div className="ml-auto flex items-center gap-5">
        <button
          onClick={handleBellClick}
          className="bg-none border-none cursor-pointer relative p-2 rounded-lg"
        >
          <Bell size={20} color="#6B7280" strokeWidth={2} />
          {unreadCount > 0 && (
            <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center px-[4px]">
              <span className="text-[10px] font-bold text-white leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </div>
          )}
        </button>

        <button className="bg-none border-none cursor-pointer p-2 rounded-lg">
          <HelpCircle size={20} color="#6B7280" strokeWidth={2} />
        </button>

        <div className="w-px h-6 bg-gray-200" />

        <span className="text-[13px] font-semibold text-[#25207E] font-inter">
          User - {userName || "xxxxxx"}
        </span>

        {isUsers && (
          <button
            onClick={() => router.push("/dashboard/users?create=true")}
            className="flex items-center gap-2 h-10 px-4 bg-[#25207E] border-none rounded-lg cursor-pointer text-[13px] font-semibold font-inter text-white"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            Añadir Usuario
          </button>
        )}
      </div>
    </header>
  );
}
