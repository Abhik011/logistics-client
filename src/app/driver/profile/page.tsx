"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DriverProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    licenseNo: "",
    licenseExpiry: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("driver_token");

    if (!token) {
      router.push("/driver/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "/api/driver-auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data;

        setForm({
          name: data.name || "",
          phone: data.phone || "",
          licenseNo: data.licenseNo || "",
          licenseExpiry: data.licenseExpiry?.split("T")[0] || "",
        });
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem("driver_token");
          router.push("/driver/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("driver_token");
    setSaving(true);

    try {
      await axios.put(
        "/api/driver-auth/profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Profile updated successfully");
    } catch (error) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-4">Loading profile...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Driver Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-3 border rounded-lg"
        />

        <input
          name="phone"
          value={form.phone}
          disabled
          className="w-full p-3 border rounded-lg bg-gray-100"
        />

        <input
          name="licenseNo"
          value={form.licenseNo}
          onChange={handleChange}
          placeholder="License Number"
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="date"
          name="licenseExpiry"
          value={form.licenseExpiry}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-black text-white p-3 rounded-xl font-semibold"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}