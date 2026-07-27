"use client";

import { ReactNode } from "react";

interface ChatBubbleProps {
  children: ReactNode;
  timestamp: string;
  isBot?: boolean;
}

export default function ChatBubble({ children, timestamp, isBot = false }: ChatBubbleProps) {
  return (
    <div className={`flex px-4 mb-2 ${isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[90%] rounded-[14px] px-4 py-3 ${
          isBot
            ? "bg-white border border-gray-200"
            : "bg-[#201A7A]"
        }`}
      >
        <div>{children}</div>
        <p
          className={`text-[11px] text-right mt-1.5 ${
            isBot ? "text-[#9CA3AF]" : "text-white/70"
          }`}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}
