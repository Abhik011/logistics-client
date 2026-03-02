"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { StatCard } from "@/components/StatCard";
import RevenueChart from "@/components/Charts/RevenueChart";
import { KpiCard } from "@/components/KpiCard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
        {error}
      </div>
    );

  const revenue = data?.revenue || {
    total: 0,
    collected: 0,
    outstanding: 0,
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 text-sm">
          Business performance summary
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        <KpiCard
          title="Total Revenue"
          value={`₹${revenue.total.toLocaleString()}`}
          change={0}
          type="revenue"
        />

        <KpiCard
          title="Collected"
          value={`₹${revenue.collected.toLocaleString()}`}
          change={0}
          type="collected"
        />

        <KpiCard
          title="Outstanding"
          value={`₹${revenue.outstanding.toLocaleString()}`}
          change={0}
          type="outstanding"
        />

        <KpiCard
          title="On-Time Delivery"
          value={`${data.onTimePercentage || 0}%`}
          change={0}
          type="delivery"
        />

      </div>

      {/* Revenue Trend */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Revenue Trend (Last 6 Months)
        </h2>

        <RevenueChart data={data.revenueTrend || []} />
      </div>

    </div>
  );
}