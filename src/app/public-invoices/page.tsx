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

    const socket = io();

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

    return () => {socket.disconnect();};
  }, []);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-gray-500">
            GST Billing & Collection Management
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border overflow-x-auto">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No invoices found
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-4 text-left">Invoice</th>
                <th className="px-6 py-4 text-left">Taxable</th>
                <th className="px-6 py-4 text-left">GST</th>
                <th className="px-6 py-4 text-left">TDS</th>
                <th className="px-6 py-4 text-left">Grand Total</th>
                <th className="px-6 py-4 text-left">Net Receivable</th>
                <th className="px-6 py-4 text-left">Paid</th>
                <th className="px-6 py-4 text-left">Outstanding</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv) => {
                const gstTotal =
                  (inv.cgstAmount || 0) +
                  (inv.sgstAmount || 0) +
                  (inv.igstAmount || 0);

                const outstanding =
                  (inv.netReceivable || inv.grandTotal) -
                  (inv.paidAmount || 0);

                return (
                  <tr key={inv.id} className="border-t hover:bg-gray-50">

                    <td className="px-6 py-4 font-medium">
                      {inv.invoiceNumber}
                    </td>

                    <td className="px-6 py-4">
                      ₹{(inv.totalAmount || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      ₹{gstTotal.toLocaleString()}
                      <div className="text-xs text-gray-400">
                        {inv.gstPercent}% GST
                      </div>
                    </td>

                    <td className="px-6 py-4 text-amber-600">
                      ₹{(inv.tdsAmount || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      ₹{(inv.grandTotal || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-blue-600 font-medium">
                      ₹{(inv.netReceivable || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-emerald-600 font-medium">
                      ₹{(inv.paidAmount || 0).toLocaleString()}
                    </td>

                    <td className={`px-6 py-4 font-semibold ${
                      outstanding > 0 ? "text-red-600" : "text-emerald-600"
                    }`}>
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