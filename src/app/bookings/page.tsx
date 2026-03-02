"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { io } from "socket.io-client";
import { Plus, Search, X } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import StatusBadge from "@/components/StatusBadge";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ================= FETCH ================= */

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Booking fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ================= SOCKET ================= */

  useEffect(() => {
    const socket = io();

    socket.on("booking-created", (newBooking) => {
      setBookings((prev) => [newBooking, ...prev]);
    });

    socket.on("booking-updated", (updatedBooking) => {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === updatedBooking.id ? updatedBooking : b
        )
      );
    });

    return () => {
      socket.disconnect();   // ✅ now returns void
    };
  }, []);

  /* ================= KPI ================= */

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      active: bookings.filter((b) =>
        ["PLANNED", "DISPATCHED", "IN_TRANSIT"].includes(b.status)
      ).length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
      delayed: bookings.filter(
        (b) =>
          b.slaDate &&
          new Date() > new Date(b.slaDate) &&
          b.status !== "COMPLETED"
      ).length,
    };
  }, [bookings]);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return bookings
      .filter((b) =>
        b.bookingNumber?.toLowerCase().includes(search.toLowerCase())
      )
      .filter((b) =>
        statusFilter === "ALL" ? true : b.status === statusFilter
      );
  }, [bookings, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            Bookings Control Panel
          </h1>
          <p className="text-sm text-gray-500">
            Shipment lifecycle management
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 shadow-md"
        >
          <Plus size={16} />
          Create Booking
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Total" value={stats.total} />
        <KpiCard label="Active" value={stats.active} />
        <KpiCard label="Completed" value={stats.completed} />
        <KpiCard label="Cancelled" value={stats.cancelled} />
        <KpiCard label="SLA Breach" value={stats.delayed} />
      </div>

      {/* FILTER */}
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Search booking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex gap-2">
          {["ALL", "CREATED", "IN_TRANSIT", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm rounded-xl border transition ${statusFilter === status
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white hover:bg-gray-50"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No bookings found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-4 text-left">Booking</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Trip</th>
                <th className="px-6 py-4 text-left">Distance</th>
                <th className="px-6 py-4 text-left">Revenue</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className="border-t hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4 font-semibold text-violet-600">
                    {b.bookingNumber}
                  </td>

                  <td className="px-6 py-4">
                    {b.customer?.name || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {b.trip ? b.trip.tripNumber : "Auto creating..."}
                  </td>

                  <td className="px-6 py-4">
                    {b.distanceKm
                      ? `${b.distanceKm.toFixed(2)} km`
                      : "-"}
                  </td>

                  <td className="px-6 py-4 text-emerald-600 font-semibold">
                    ₹{b.revenue?.toLocaleString() || 0}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <BookingForm onClose={() => setOpen(false)} />
      )}

      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onLocalUpdate={(updated: any) =>
            setBookings((prev) =>
              prev.map((b) =>
                b.id === updated.id ? updated : b
              )
            )
          }
        />
      )}
    </div>
  );
}

/* ================= DRAWER ================= */

function BookingDrawer({ booking, onClose, onLocalUpdate }: any) {
  const [status, setStatus] = useState(booking.status);

  const updateStatus = async (newStatus: string) => {
    const res = await api.patch(
      `/bookings/${booking.id}/status`,
      { status: newStatus }
    );

    setStatus(newStatus);
    onLocalUpdate(res.data);
  };

  const invoice = booking.invoice;
  const trip = booking.trip;

  const outstanding =
    invoice
      ? (invoice.netReceivable || invoice.grandTotal) -
      invoice.paidAmount
      : 0;

  const profit =
    (trip?.revenue || 0) -
    (trip?.actualCost || 0);

 const steps = [
  "CREATED",
  "PLANNED",
  "DISPATCHED",
  "IN_TRANSIT",
  "COMPLETED",
];

  return (
    <div className="fixed inset-0 flex z-50">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="w-[620px] bg-white shadow-2xl p-6 overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold mb-6">
          {booking.bookingNumber}
        </h2>

        <Section title="Customer">
          {booking.customer?.name}
        </Section>

        <Section title="Route">
          {booking.pickupAddress} → {booking.deliveryAddress}
        </Section>

        <Section title="Distance">
          {booking.distanceKm
            ? `${booking.distanceKm.toFixed(2)} km`
            : "Not calculated"}
        </Section>

        <Section title="Cargo">
          {booking.commodity} • {booking.weight} Tons • {booking.volume} CBM
        </Section>

        {/* TRIP DETAILS */}
        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-gray-500 uppercase mb-2">
            Trip Details
          </p>

          {trip ? (
            <div className="space-y-2 text-sm">
              <div><strong>Trip:</strong> {trip.tripNumber}</div>
              <div><strong>Status:</strong> {trip.status}</div>
              <div>
  <strong>Billable KM:</strong>{" "}
  {booking.distanceKm?.toFixed(2) || 0} km
</div>

<div>
  <strong>GPS KM:</strong>{" "}
  {trip.distanceCovered?.toFixed(2) || 0} km
</div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Trip auto-creation pending...
            </p>
          )}
        </div>

        {/* FINANCE */}
        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-gray-500 uppercase mb-2">
            Financial Details
          </p>

          <div className="mt-3 p-3 rounded-xl bg-gray-50 border">
            <div className="flex justify-between text-sm">
              <span>Revenue</span>
              <span className="text-emerald-600 font-semibold">
               ₹{trip?.revenue?.toLocaleString() || 0}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Cost</span>
              <span>
                ₹{trip?.actualCost?.toLocaleString() || 0}
              </span>
            </div>

            <div className="flex justify-between text-sm font-semibold">
              <span>Profit</span>
              <span
                className={
                  profit >= 0
                    ? "text-blue-600"
                    : "text-red-600"
                }
              >
                ₹{profit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="mt-6 border-t pt-4">
          <label className="text-xs text-gray-500">
            Update Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              updateStatus(e.target.value)
            }
            className="w-full mt-1 p-2 border rounded-lg"
          >
            {steps.concat("CANCELLED").map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function KpiCard({ label, value }: any) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-2">
        {value}
      </p>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 uppercase">
        {title}
      </p>
      <p className="font-medium mt-1">
        {children}
      </p>
    </div>
  );
}