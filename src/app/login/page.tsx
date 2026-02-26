"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    setAuth(res.data.user, res.data.access_token);
    router.push("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Logistics ERP Login
        </h1>

        <input
          className="w-full border p-3 rounded-lg"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-3 rounded-lg"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-violet-600 text-white p-3 rounded-lg hover:bg-violet-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}