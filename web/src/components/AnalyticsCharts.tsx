"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";

export interface AreaDataPoint {
  name: string;
  trafico: number;
  conversiones: number;
}

export interface DonutDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface StatusBarDataPoint {
  name: string;
  pendientes: number;
  enProceso: number;
  resueltos: number;
}

interface TrafficChartProps {
  data: AreaDataPoint[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  const { theme } = useTheme();
  const tickFill = theme === "dark" ? "#9CA3AF" : "#9CA3AF";
  const gridStroke = theme === "dark" ? "#374151" : "#F3F4F6";
  const tooltipBg = theme === "dark" ? "#1e293b" : "#FFFFFF";
  const tooltipColor = theme === "dark" ? "#e2e8f0" : undefined;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTrafico" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#25207E" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#25207E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorConvs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A1A1AA" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#A1A1AA" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickFill }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: tickFill }} axisLine={false} tickLine={false} width={50} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            backgroundColor: tooltipBg,
            color: tooltipColor,
          }}
        />
        <Area type="monotone" dataKey="trafico" stroke="#25207E" strokeWidth={2.5} fill="url(#colorTrafico)" />
        <Area type="monotone" dataKey="conversiones" stroke="#A1A1AA" strokeWidth={2.5} fill="url(#colorConvs)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface DonutChartProps {
  data: DonutDataPoint[];
  allPvNames?: string[];
}

export function DonutChart({ data, allPvNames }: DonutChartProps) {
  const { theme } = useTheme();
  const safeData = Array.isArray(data) ? data : [];
  const labelColor = theme === "dark" ? "#9CA3AF" : "#6B7280";
  const tooltipBg = theme === "dark" ? "#1e293b" : "#FFFFFF";
  const tooltipColor = theme === "dark" ? "#e2e8f0" : undefined;

  const pvColorMap = new Map(safeData.map((d) => [d.name, d.color]));
  const pvValueMap = new Map(safeData.map((d) => [d.name, d.value]));
  const allPvs = allPvNames || [];
  const colors = ["#25207E", "#7C3AED", "#3B82F6", "#F59E0B", "#EF4444", "#22C55E", "#EC4899", "#14B8A6"];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={safeData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {safeData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              backgroundColor: tooltipBg,
              color: tooltipColor,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="w-full max-h-40 overflow-y-auto">
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {allPvs.map((name, i) => {
            const hasData = pvColorMap.has(name);
            const color = hasData ? (pvColorMap.get(name) || colors[i % colors.length]) : "#E5E7EB";
            const valor = hasData ? pvValueMap.get(name) : 0;
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: labelColor, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {name}
                </span>
                <span style={{ fontSize: "11px", fontWeight: hasData ? 600 : 400, color: hasData ? color : "#D1D5DB", fontFamily: "Inter, sans-serif", flexShrink: 0 }}>
                  {hasData ? `${valor}%` : "0%"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface StatusBarChartProps {
  data: StatusBarDataPoint[];
}

export function StatusBarChart({ data }: StatusBarChartProps) {
  const { theme } = useTheme();
  const safeData = Array.isArray(data) ? data : [];
  const tickFill = theme === "dark" ? "#9CA3AF" : "#9CA3AF";
  const gridStroke = theme === "dark" ? "#374151" : "#F3F4F6";
  const tooltipBg = theme === "dark" ? "#1e293b" : "#FFFFFF";
  const tooltipColor = theme === "dark" ? "#e2e8f0" : undefined;

  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <span className="text-[14px] text-gray-400 dark:text-gray-500 font-inter">
          Sin datos
        </span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={safeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickFill }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: tickFill }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            backgroundColor: tooltipBg,
            color: tooltipColor,
          }}
        />
        <Bar dataKey="pendientes" name="Pendientes" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={60} />
        <Bar dataKey="enProceso" name="En Proceso" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={60} />
        <Bar dataKey="resueltos" name="Resueltos" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={60} />
      </BarChart>
    </ResponsiveContainer>
  );
}
