"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Ticket,
  Monitor,
  LogOut,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Panel de control", path: "/dashboard" },
  { icon: BarChart3, label: "Analítica", path: "/dashboard/analytics" },
  { icon: Users, label: "Gestión de Usuarios", path: "/dashboard/users" },
  { icon: Ticket, label: "Tickets", path: "/dashboard/tickets" },
  { icon: Monitor, label: "Sistemas Externos", path: "/dashboard/external-systems" },
];

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const initials = user?.nombre
    ? user.nombre
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";
  const displayName = user?.nombre || "Usuario";

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[250px] bg-white border-r border-gray-200 flex flex-col z-40">
      <div className="flex items-center px-5 py-5 pb-6 gap-2.5">
        <Image
          src={logoImg}
          alt="Logo"
          width={32}
          height={32}
          style={{ borderRadius: "6px" }}
        />
        <span className="text-sm font-medium text-gray-700 font-inter">
          Admin Dashboard
        </span>
      </div>

      <nav className="flex-1 flex flex-col px-3 gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.label}
              href={item.path}
              className="flex items-center h-12 rounded-lg px-3 gap-3 relative font-inter text-sm no-underline w-full transition-colors duration-150"
              style={{
                backgroundColor: isActive ? "#F3F0FF" : "transparent",
                color: isActive ? "#25207E" : "#6B7280",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#25207E] rounded-r-md" />
              )}
              <item.icon
                size={20}
                color={isActive ? "#25207E" : "#9CA3AF"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-5 border-t border-gray-200">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#25207E] flex items-center justify-center text-white text-sm font-semibold font-inter">
            {initials}
          </div>
          <span className="text-[13px] font-medium text-gray-800 font-inter">
            {displayName}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-full h-9 rounded-lg border border-gray-200 bg-white cursor-pointer text-[13px] font-medium font-inter text-red-600 flex items-center justify-center gap-1.5"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
