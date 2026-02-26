"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import CustomerForm from "@/components/CustomerForm";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

const fetchCustomers = async () => {
  setLoading(true);
  try {
    const res = await api.get("/customers");

    console.log("Response:", res.data);

   setCustomers(res.data.data);
  } catch (error) {
    console.error(error);
    setCustomers([]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Customers
          </h1>
          <p className="text-sm text-gray-500">
            Manage and monitor all customer accounts
          </p>
        </div>

        <button className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 transition shadow-md" onClick={() => setOpen(true)}>
          <Plus size={16} />
          
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative w-80">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by name or GST..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading customers...
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No customers found
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">GST Number</th>
                  <th className="px-6 py-4 text-left">Credit Limit</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((c: any) => (
                  <tr
                    key={c.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {c.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {c.gstNumber || "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-700 font-medium">
                      ₹{(c.creditLimit || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          c.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center px-6 py-4 border-t text-sm text-gray-600">
              <span>
                Showing page {meta?.page} of {meta?.totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  disabled={page >= meta?.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {open && (
  <div className="fixed inset-0 z-50 flex">
    
    {/* Overlay */}
    <div
      className="flex-1 bg-black/40"
      onClick={() => setOpen(false)}
    />

    {/* Drawer */}
    <div className="w-[420px] bg-white shadow-2xl p-6 animate-slideIn">
      <h2 className="text-lg font-semibold mb-6">
        Add New Customer
      </h2>

      <CustomerForm onClose={() => setOpen(false)} />
    </div>
  </div>
)}
    </div>
  );
}