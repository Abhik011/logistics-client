"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function BookingForm({ onClose }: any) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    serviceType: "FTL",
    pickupAddress: "",
    deliveryAddress: "",
    weight: "",
    volume: "",
    commodity: "",
    customerId: "",
  });

  useEffect(() => {
    api.get("/customers").then((res) => {
      setCustomers(res.data.data);
    });
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await api.post("/bookings", {
      ...form,
      weight: Number(form.weight),
      volume: Number(form.volume),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
      />

      <div className="w-[480px] bg-white p-6 shadow-2xl">

        <h2 className="text-lg font-semibold mb-6">
          Create Booking
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <select
            required
            className="w-full border p-2 rounded-lg"
            value={form.customerId}
            onChange={(e) =>
              setForm({ ...form, customerId: e.target.value })
            }
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            required
            placeholder="Pickup Address"
            className="w-full border p-2 rounded-lg"
            value={form.pickupAddress}
            onChange={(e) =>
              setForm({ ...form, pickupAddress: e.target.value })
            }
          />

          <input
            required
            placeholder="Delivery Address"
            className="w-full border p-2 rounded-lg"
            value={form.deliveryAddress}
            onChange={(e) =>
              setForm({ ...form, deliveryAddress: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            className="w-full border p-2 rounded-lg"
            value={form.weight}
            onChange={(e) =>
              setForm({ ...form, weight: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Volume"
            className="w-full border p-2 rounded-lg"
            value={form.volume}
            onChange={(e) =>
              setForm({ ...form, volume: e.target.value })
            }
          />

          <input
            placeholder="Commodity"
            className="w-full border p-2 rounded-lg"
            value={form.commodity}
            onChange={(e) =>
              setForm({ ...form, commodity: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-violet-600 text-white rounded-lg"
            >
              Create
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}