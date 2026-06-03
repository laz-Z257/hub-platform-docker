import type { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string;
}

export default function MetricCard({ icon, title, value }: MetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        padding: "20px",
        width: "100%",
        minHeight: "130px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          backgroundColor: "#F3F0FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 500,
            color: "#6B7280",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: 0,
            marginTop: "2px",
            fontSize: "28px",
            fontWeight: 700,
            color: "#1F2937",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
