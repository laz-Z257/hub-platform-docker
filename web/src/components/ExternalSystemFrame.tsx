"use client";

import { LayoutGrid } from "lucide-react";

interface ExternalSystemFrameProps {
  src?: string;
  title?: string;
}

export default function ExternalSystemFrame({
  src,
  title = "Sistema Externo",
}: ExternalSystemFrameProps) {
  return (
    <div className="w-[95%] h-[620px] bg-[#EEF2FF] dark:bg-gray-800 rounded-lg border border-[#E5E7EB] dark:border-gray-700 relative overflow-hidden flex items-center justify-center">
      {/* X guideline */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="0"
          x2="100"
          y2="100"
          stroke="#D8DDEA"
          strokeWidth="0.5"
        />
        <line
          x1="100"
          y1="0"
          x2="0"
          y2="100"
          stroke="#D8DDEA"
          strokeWidth="0.5"
        />
      </svg>

      {src ? (
        <iframe
          src={src}
          title={title}
          className="w-full h-full relative z-10"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 relative z-10">
          <LayoutGrid size={64} color="#9CA3AF" />
          <span
            className="text-[#9CA3AF] font-medium uppercase tracking-[2px]"
            style={{ fontSize: "14px" }}
          >
            SISTEMAS ADMINISTRATIVOS - IFRAME
          </span>
        </div>
      )}
    </div>
  );
}
