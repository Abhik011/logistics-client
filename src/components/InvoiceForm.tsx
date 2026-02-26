"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function InvoiceForm({ onClose }: any) {
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await api.post("/invoices", {
      bookingIds: [bookingId],
      totalAmount: Number(amount),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">

      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
      />

      <div className="w-[420px] bg-white p-6 shadow-2xl">

        <h2 className="text-lg font-semibold mb-6">
          Create Invoice
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            required
            placeholder="Booking ID"
            className="w-full border p-2 rounded-lg"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />

          <input
            required
            type="number"
            placeholder="Total Amount"
            className="w-full border p-2 rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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