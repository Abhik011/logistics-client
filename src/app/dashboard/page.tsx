"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { StatCard } from "@/components/StatCard";
import RevenueChart from "@/components/charts/RevenueChart";
import { KpiCard } from "@/components/KpiCard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5500/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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

      {/* Stats Grid */}
   

<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

  <KpiCard
    title="Total Revenue"
    value={`₹${data.revenue.total.toLocaleString()}`}
    change={12.5}
    type="revenue"
  />

  <KpiCard
    title="Collected"
    value={`₹${data.revenue.collected.toLocaleString()}`}
    change={8.2}
    type="collected"
  />

  <KpiCard
    title="Outstanding"
    value={`₹${data.revenue.outstanding.toLocaleString()}`}
    change={-3.4}
    type="outstanding"
  />

  <KpiCard
    title="On-Time Delivery"
    value={`${data.onTimePercentage}%`}
    change={4.1}
    type="delivery"
  />

</div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Revenue Trend (Last 6 Months)
        </h2>
        <RevenueChart data={data.revenueTrend} />
      </div>

    </div>
  );
}