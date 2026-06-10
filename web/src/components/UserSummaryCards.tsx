"use client";

import { Users, Zap, Mail } from "lucide-react";

interface SummaryCardsProps {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  loading: boolean;
}

export default function UserSummaryCards({ totalUsers, adminCount, userCount, loading }: SummaryCardsProps) {
  const cards = [
    {
      icon: Users,
      title: "Total Usuarios",
      value: loading ? "..." : totalUsers.toLocaleString(),
      iconBg: "#F3F0FF",
      iconColor: "#25207E",
    },
    {
      icon: Zap,
      title: "Administradores",
      value: loading ? "..." : adminCount.toLocaleString(),
      iconBg: "#ECFDF5",
      iconColor: "#22C55E",
    },
    {
      icon: Mail,
      title: "Usuarios",
      value: loading ? "..." : userCount.toLocaleString(),
      iconBg: "#F3F0FF",
      iconColor: "#25207E",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 max-w-[860px] mb-7">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-[18px] min-h-[110px] flex flex-col justify-center gap-2.5"
        >
          <div
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center"
            style={{ backgroundColor: card.iconBg }}
          >
            <card.icon size={19} color={card.iconColor} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 font-inter">{card.title}</p>
            <p className="text-[36px] font-bold text-[#25207E] font-inter leading-tight mt-0.5">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
