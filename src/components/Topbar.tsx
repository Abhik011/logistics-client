"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  Moon,
  Sun,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

export function Topbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🌙 Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // 🔒 Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 h-16 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 shadow-sm">

      {/* 🔍 Search */}
      <div className="relative w-[420px] hidden md:block">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          placeholder="Search bookings, customers, invoices..."
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 relative">

        {/* 🌙 Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* 🔔 Notifications */}
        <div className="relative cursor-pointer">
          <Bell size={18} className="text-gray-600 dark:text-gray-300" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-[1px] rounded-full animate-pulse">
            3
          </span>
        </div>

        {/* 👤 User Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-xl transition"
          >
            <div className="h-9 w-9 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center rounded-full text-sm font-semibold shadow-md">
              {user?.name?.charAt(0)}
            </div>

            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role}
              </p>
            </div>

            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl overflow-hidden animate-fadeIn">

              {/* <div className="px-4 py-4 border-b dark:border-gray-800">
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div> */}

              <button
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition"
              >
                <User size={16} />
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900 text-sm text-red-600 transition"
              >
                <LogOut size={16} />
                Logout
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}