"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DriverLogin() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("driver_token");
    if (token) {
      router.push("/driver/dashboard");
    }
  }, [router]);

  const login = async () => {
    setError("");

    if (!phone || !password) {
      setError("Please enter phone and password");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5500/driver-auth/login",
        { phone, password }
      );

      localStorage.setItem("driver_token", res.data.accessToken);

      router.push("/driver/dashboard");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid phone or password");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-sm space-y-5">
        <h2 className="text-2xl font-bold text-center">
          Driver Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-2 rounded-lg text-center">
            {error}
          </div>
        )}

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}