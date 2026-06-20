import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  from,
  to,
  itemLabel = "elementos",
  onPageChange,
}: PaginationProps) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between mt-5">
      <span className="text-[13px] text-[#6B7280] dark:text-gray-400 font-inter">
        Mostrando {from}-{to} de {total.toLocaleString()} {itemLabel}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white dark:border-gray-700 dark:bg-gray-900"
          style={{
            cursor: page === 1 ? "default" : "pointer",
            opacity: page === 1 ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={14} color="#6B7280" strokeWidth={2} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`dot-${i}`}
              className="w-8 h-8 flex items-center justify-center text-[13px] text-[#9CA3AF] dark:text-gray-400 font-inter"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-inter cursor-pointer"
              style={{
                border: page === p ? "none" : "1px solid #E5E7EB",
                backgroundColor: page === p ? "#25207E" : "#FFFFFF",
                color: page === p ? "#FFFFFF" : "#374151",
                fontWeight: page === p ? 600 : 400,
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white dark:border-gray-700 dark:bg-gray-900"
          style={{
            cursor: page === totalPages ? "default" : "pointer",
            opacity: page === totalPages ? 0.5 : 1,
          }}
        >
          <ChevronRight size={14} color="#6B7280" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
