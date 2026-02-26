import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Wallet,
  AlertCircle,
  Truck,
} from "lucide-react";

interface Props {
  title: string;
  value: string;
  change?: number; // percentage change
  type?: "revenue" | "collected" | "outstanding" | "delivery";
}

export function KpiCard({ title, value, change = 0, type }: Props) {
  const isPositive = change >= 0;

  const iconMap = {
    revenue: IndianRupee,
    collected: Wallet,
    outstanding: AlertCircle,
    delivery: Truck,
  };

  const Icon = iconMap[type || "revenue"];

  return (
    <div className="relative bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group">

      {/* Top Row */}
      <div className="flex justify-between items-start">

        <div>
          <p className="text-sm text-gray-500 font-medium">
            {title}
          </p>
          <h2 className="text-2xl font-semibold mt-2 text-gray-900">
            {value}
          </h2>
        </div>

        <div className="p-3 rounded-xl bg-gray-100 group-hover:scale-110 transition">
          <Icon className="w-5 h-5 text-gray-700" />
        </div>

      </div>

      {/* Trend Section */}
      <div className="mt-4 flex items-center gap-2">

        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-rose-600" />
        )}

        <span
          className={`text-sm font-semibold ${
            isPositive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {change}%
        </span>

        <span className="text-xs text-gray-400">
          vs last month
        </span>

      </div>

      {/* Subtle Glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-indigo-100/20 to-purple-100/20" />

    </div>
  );
}