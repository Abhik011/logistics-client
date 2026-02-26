"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-black">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          Loading Logistics ERP...
        </h1>
      </div>
    </div>
  );
}