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
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={50} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
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
}

export function DonutChart({ data }: DonutChartProps) {
  const safeData = Array.isArray(data) ? data : [];
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
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
        {safeData.map((item) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: item.color }} />
            <span style={{ fontSize: "13px", color: "#6B7280", fontFamily: "Inter, sans-serif" }}>
              {item.name} ({item.value}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatusBarChartProps {
  data: StatusBarDataPoint[];
}

export function StatusBarChart({ data }: StatusBarChartProps) {
  const safeData = Array.isArray(data) ? data : [];
  if (safeData.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 280 }}>
        <span style={{ fontSize: "14px", color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}>
          Sin datos
        </span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={safeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        />
        <Bar dataKey="pendientes" name="Pendientes" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={60} />
        <Bar dataKey="enProceso" name="En Proceso" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={60} />
        <Bar dataKey="resueltos" name="Resueltos" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={60} />
      </BarChart>
    </ResponsiveContainer>
  );
}
