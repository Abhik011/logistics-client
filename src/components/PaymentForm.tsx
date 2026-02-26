"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function PaymentForm({ onClose }: any) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    invoiceId: "",
    amount: "",
    paymentDate: "",
    referenceNo: "",
    notes: "",
  });

  useEffect(() => {
    api.get("/invoices").then((res) => {
      setInvoices(res.data);
    });
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await api.post("/payments", {
      invoiceId: form.invoiceId,
      amount: Number(form.amount),
      paymentDate: form.paymentDate,
      referenceNo: form.referenceNo,
      notes: form.notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">

      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
      />

      <div className="w-[450px] bg-white p-6 shadow-2xl">

        <h2 className="text-lg font-semibold mb-6">
          Add Payment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Invoice Dropdown */}
          <select
            required
            className="w-full border p-2 rounded-lg"
            value={form.invoiceId}
            onChange={(e) =>
              setForm({ ...form, invoiceId: e.target.value })
            }
          >
            <option value="">Select Invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber}
              </option>
            ))}
          </select>

          <input
            required
            type="number"
            placeholder="Amount"
            className="w-full border p-2 rounded-lg"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
          />

          <input
            required
            type="date"
            className="w-full border p-2 rounded-lg"
            value={form.paymentDate}
            onChange={(e) =>
              setForm({ ...form, paymentDate: e.target.value })
            }
          />

          <input
            placeholder="Reference No (UTR)"
            className="w-full border p-2 rounded-lg"
            value={form.referenceNo}
            onChange={(e) =>
              setForm({ ...form, referenceNo: e.target.value })
            }
          />

          <textarea
            placeholder="Notes"
            className="w-full border p-2 rounded-lg"
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
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
              Save Payment
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}