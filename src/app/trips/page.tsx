"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Plus } from "lucide-react";
import TripForm from "@/components/TripForm";
import TripStatusBadge from "@/components/TripStatusBadge";
import { io, Socket } from "socket.io-client";

/* ================= TRIP DRAWER ================= */

function TripDrawer({ trip, onClose }: any) {
  const [location, setLocation] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchLocation();
    fetchVehicles();

    socketRef.current = io("/api");

    socketRef.current.on("trip-location-updated", (data: any) => {
      if (data.tripId === trip.id) {
        setLocation(data);
      }
    });

    return () => { socketRef.current?.disconnect(); }
  }, [trip.id]);

  const fetchLocation = async () => {
    const res = await api.get(`/trips/${trip.id}/latest-location`);
    setLocation(res.data);
  };

  const fetchVehicles = async () => {
    const res = await api.get("/vehicles");
    setVehicles(res.data || []);
  };

  const assignVehicle = async (vehicleId: string) => {
    try {
      setAssigning(true);
      await api.patch(`/trips/${trip.id}/assign-vehicle`, {
        vehicleId,
      });
    } catch (err) {
      alert("Vehicle assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 flex z-50">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="w-[600px] bg-white shadow-2xl p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">
          {trip.tripNumber}
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          {trip.vehicle?.registrationNo || "No Vehicle"} •{" "}
          {trip.driver?.name || "No Driver"}
        </p>

        {/* 🚗 Vehicle Allocation */}
        {!trip.vehicle && (
          <div className="mb-6">
            <label className="text-sm text-gray-500">
              Assign Vehicle
            </label>

            <select
              className="w-full mt-2 p-2 border rounded-lg"
              onChange={(e) => assignVehicle(e.target.value)}
              disabled={assigning}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNo} ({v.vehicleType})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="h-[400px] rounded-xl overflow-hidden border">
          {location ? (
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              src={`https://www.google.com/maps/embed/v1/directions?key=YOUR_GOOGLE_MAPS_KEY
  &origin=${trip.startLatitude},${trip.startLongitude}
  &destination=${trip.endLatitude},${trip.endLongitude}
  &mode=driving`}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Waiting for GPS signal...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= TRIPS PAGE ================= */

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get("/trips");
      setTrips(res.data || []);
    } catch (err) {
      console.error("Trip fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();

    socketRef.current = io("/api");

    socketRef.current.on("trip-created", (newTrip) => {
      setTrips((prev) => [newTrip, ...prev]);
    });

    socketRef.current.on("trip-updated", (updatedTrip) => {
      setTrips((prev) =>
        prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t))
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Trips</h1>
          <p className="text-sm text-gray-500">
            Plan and manage vehicle movements
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 transition"
        >
          <Plus size={16} />
          Create Trip
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading trips...
          </div>
        ) : trips.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No trips found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-4 text-left">Trip No</th>
                <th className="px-6 py-4 text-left">Vehicle</th>
                <th className="px-6 py-4 text-left">Driver</th>
                <th className="px-6 py-4 text-left">Start Date</th>
                <th className="px-6 py-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {trips.map((trip) => (
                <tr
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className="border-t hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4 font-medium">
                    {trip.tripNumber}
                  </td>

                  <td className="px-6 py-4">
                    {trip.vehicle?.registrationNo || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {trip.driver?.name || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(trip.startDate).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <TripStatusBadge status={trip.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DRAWER */}
      {selectedTrip && (
        <TripDrawer
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
        />
      )}

      {/* FORM */}
      {open && (
        <TripForm
          onClose={() => {
            setOpen(false);
            fetchTrips();
          }}
        />
      )}
    </div>
  );
}