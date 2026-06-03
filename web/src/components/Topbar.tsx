"use client";

import { Bell, HelpCircle, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: "250px",
        right: 0,
        height: "70px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        zIndex: 30,
      }}
    >
      {/* Search */}
      <div
        style={{
          position: "relative",
          width: "340px",
        }}
      >
        <Search
          size={18}
          color="#9CA3AF"
          strokeWidth={2}
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <input
          type="text"
          placeholder="Buscar en el sistema..."
          style={{
            width: "100%",
            height: "40px",
            border: "1px solid #E5E7EB",
            borderRadius: "20px",
            backgroundColor: "#F9FAFB",
            padding: "0 16px 0 40px",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
            color: "#1F2937",
            outline: "none",
          }}
        />
      </div>

      {/* Right Section */}
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Notification */}
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            position: "relative",
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          <Bell size={20} color="#6B7280" strokeWidth={2} />
          <div
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#EF4444",
              border: "2px solid #FFFFFF",
            }}
          />
        </button>

        {/* Help */}
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          <HelpCircle size={20} color="#6B7280" strokeWidth={2} />
        </button>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "24px",
            backgroundColor: "#E5E7EB",
          }}
        />

        {/* User */}
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#6B7280",
            fontFamily: "Inter, sans-serif",
          }}
        >
          User - xxxxxx
        </span>
      </div>
    </header>
  );
}
