"use client";

import ExternalSystemFrame from "@/components/ExternalSystemFrame";

export default function ExternalSystemsPage() {
  return (
    <div className="flex flex-col items-center w-full min-h-full bg-[#F7F8FC] dark:bg-gray-950 pt-8 px-4">
      <ExternalSystemFrame />
      <div className="w-[95%] h-px bg-[#E5E7EB] dark:bg-gray-700 mt-10" />
    </div>
  );
}
