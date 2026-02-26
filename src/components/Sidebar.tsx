"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Receipt,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4.5 border-b border-gray-200">
        {!collapsed && (
          <span className="text-lg font-semibold tracking-wide">
            Logistics ERP
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2">
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          collapsed={collapsed}
          active={pathname === "/dashboard"}
        />
        <NavItem
          href="/customers"
          icon={<Users size={18} />}
          label="Customers"
          collapsed={collapsed}
          active={pathname === "/customers"}
        />
        <NavItem
          href="/bookings"
          icon={<FileText size={18} />}
          label="Bookings"
          collapsed={collapsed}
          active={pathname === "/bookings"}
        />
        <NavItem
          href="/trips"
          icon={<Truck size={18} />}
          label="Trips"
          collapsed={collapsed}
          active={pathname === "/trips"}
        />
        <NavItem
          href="/vehicles"
          icon={<Truck size={18} />}
          label="Vehicles"
          collapsed={collapsed}
          active={pathname === "/vehicles"}
        />
        <NavItem
          href="/invoices"
          icon={<Receipt size={18} />}
          label="Invoices"
          collapsed={collapsed}
          active={pathname === "/invoices"}
        />
        <NavItem
          href="/payments"
          icon={<CreditCard size={18} />}
          label="Payments"
          collapsed={collapsed}
          active={pathname === "/payments"}
        />
      </nav>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  collapsed,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
        ${
          active
            ? "bg-indigo-50 text-indigo-600 font-medium"
            : "hover:bg-gray-100 text-gray-700"
        }
      `}
    >
      <div className="flex items-center justify-center">
        {icon}
      </div>

      {!collapsed && (
        <span className="text-sm tracking-wide">
          {label}
        </span>
      )}
    </Link>
  );
}