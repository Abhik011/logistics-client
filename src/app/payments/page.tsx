"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus } from "lucide-react";
import PaymentForm from "@/components/PaymentForm";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (err) {
      console.error("Payment fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Payments
          </h1>
          <p className="text-sm text-gray-500">
            Track collections and settlements
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700"
        >
          <Plus size={16} />
          Add Payment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No payments found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Invoice</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Reference</th>
                <th className="px-6 py-4 text-left">Notes</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {new Date(p.paymentDate).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 font-medium">
                    {p.invoice?.invoiceNumber}
                  </td>

                  <td className="px-6 py-4 text-emerald-600 font-semibold">
                    ₹{p.amount.toLocaleString()}
                  </td>

                  <td className="px-6 py-4">
                    {p.referenceNo || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {p.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {open && (
        <PaymentForm
          onClose={() => {
            setOpen(false);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
}