"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function CustomerForm({ onClose }: any) {
  const [form, setForm] = useState({
    name: "",
    gstNumber: "",
    creditLimit: "",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await api.post("/customers", {
      name: form.name,
      gstNumber: form.gstNumber,
      creditLimit: Number(form.creditLimit),
    });

    onClose();
    window.location.reload(); // temporary refresh
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="text-sm">Customer Name</label>
        <input
          required
          className="w-full border rounded-lg p-2 mt-1"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />
      </div>

      <div>
        <label className="text-sm">GST Number</label>
        <input
          className="w-full border rounded-lg p-2 mt-1"
          value={form.gstNumber}
          onChange={(e) =>
            setForm({ ...form, gstNumber: e.target.value })
          }
        />
      </div>

      <div>
        <label className="text-sm">Credit Limit</label>
        <input
          type="number"
          className="w-full border rounded-lg p-2 mt-1"
          value={form.creditLimit}
          onChange={(e) =>
            setForm({ ...form, creditLimit: e.target.value })
          }
        />
      </div>

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
          Save
        </button>
      </div>

    </form>
  );
}