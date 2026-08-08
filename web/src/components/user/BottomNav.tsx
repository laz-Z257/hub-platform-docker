"use client";

import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, AlertTriangle, History, Settings } from "lucide-react";

const TABS = [
  { label: "Chatbot", icon: MessageSquare, href: "/user/chat", id: "chatbot" },
  { label: "Reportar", icon: AlertTriangle, href: "/user/reportar", id: "reportar" },
  { label: "Historial", icon: History, href: "/user/historial", id: "historial" },
  { label: "Ajustes", icon: Settings, href: "/user/ajustes", id: "ajustes" },
] as const;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = TABS.find((t) => pathname === t.href || pathname.startsWith(t.href + "/"))?.id || "chatbot";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex flex-row px-2">
        {TABS.map(({ label, icon: Icon, href, id }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => router.push(href)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 mx-0.5 rounded-xl transition-colors ${
                isActive ? "bg-[#EEEDF8]" : "bg-transparent"
              }`}
            >
              <Icon
                size={22}
                className={isActive ? "text-[#1F2366]" : "text-gray-400"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[11px] mt-0.5 ${
                  isActive ? "text-[#1F2366] font-semibold" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
