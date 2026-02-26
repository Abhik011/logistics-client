"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({ data }: any) {
  const formatted = Object.entries(data).map(([month, value]) => ({
    month,
    revenue: value,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">
        Monthly Revenue Trend
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formatted}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#7c3aed" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}