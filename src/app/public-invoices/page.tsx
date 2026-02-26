"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus } from "lucide-react";
import InvoiceForm from "@/components/InvoiceForm";
import InvoiceStatusBadge from "@/components/InvoiceStatusBadge";
import { io } from "socket.io-client";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data || []);
    } catch (err) {
      console.error("Invoice fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();

   const socket = io({
  transports: ["websocket"],   // 🔥 force websocket only
});

    socket.on("invoice-created", (newInvoice) => {
      setInvoices((prev) => [newInvoice, ...prev]);
    });

    socket.on("invoice-updated", (updatedInvoice) => {
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === updatedInvoice.id ? updatedInvoice : i
        )
      );
    });

    return () => { socket.disconnect(); }
  }, []);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-gray-500">
            Manage billing and collections
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700"
        >
          <Plus size={16} />
          Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No invoices found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-4 text-left">Invoice No</th>
                <th className="px-6 py-4 text-left">Total</th>
                <th className="px-6 py-4 text-left">Paid</th>
                <th className="px-6 py-4 text-left">Outstanding</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv) => {
                const outstanding =
                  (inv.netReceivable || inv.grandTotal) - inv.paidAmount;

                return (
                  <tr key={inv.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {inv.invoiceNumber}
                    </td>

                    <td className="px-6 py-4">
                      ₹{inv.grandTotal.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-emerald-600 font-medium">
                      ₹{inv.paidAmount.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-red-600 font-medium">
                      ₹{outstanding.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

      </div>

      {open && (
        <InvoiceForm
          onClose={() => {
            setOpen(false);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}