"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function FinanceDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get("/finance/summary");
    setData(res.data);
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Finance Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <Card title="Total Revenue" value={data.totalRevenue} />
        <Card title="Total Outstanding" value={data.totalOutstanding} />
        <Card title="Overdue Amount" value={data.totalOverdue} />
        <Card title="Total Profit" value={data.totalProfit} />
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">₹ {value?.toFixed(2)}</p>
    </div>
  );
}