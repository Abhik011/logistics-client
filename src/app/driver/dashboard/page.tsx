"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Play, Navigation, LogOut, User } from "lucide-react";

export default function Dashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTrips = async () => {
    const token = localStorage.getItem("driver_token");

    const res = await axios.get(
      "http://localhost:5500/driver/my-trips",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setTrips(res.data);
  };

  useEffect(() => {
    const token = localStorage.getItem("driver_token");
    if (!token) {
      router.push("/driver/login");
      return;
    }

    fetchTrips().finally(() => setLoading(false));
  }, [router]);

  const updateStatus = async (tripId: string, status: string) => {
    const token = localStorage.getItem("driver_token");

    await axios.patch(
      `http://localhost:5500/driver/trip/${tripId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchTrips();
  };

  if (loading)
    return <div className="p-6 text-gray-500">Loading trips...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">
          Driver Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/driver/profile")}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm hover:opacity-90 transition"
          >
            <User size={16} />
            Profile
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("driver_token");
              router.push("/driver/login");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:opacity-90 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Trips */}
      <div className="p-6 space-y-5">
        <h2 className="text-lg font-semibold">Active Trips</h2>

        {trips.length === 0 && (
          <div className="bg-white p-6 rounded-2xl shadow text-gray-500 text-center">
            No active trips assigned
          </div>
        )}

        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-300 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">
                  {trip.tripNumber}
                </p>
                <p className="text-sm text-gray-500">
                  Vehicle: {trip.vehicle?.registrationNo}
                </p>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  trip.status === "IN_TRANSIT"
                    ? "bg-green-100 text-green-600"
                    : trip.status === "DISPATCHED"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {trip.status}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {trip.status === "PLANNED" && (
                <button
                  onClick={() =>
                    updateStatus(trip.id, "DISPATCHED")
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl hover:opacity-90 transition"
                >
                  <Play size={16} />
                  Start Trip
                </button>
              )}

              {trip.status === "DISPATCHED" && (
                <button
                  onClick={() =>
                    updateStatus(trip.id, "IN_TRANSIT")
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:opacity-90 transition"
                >
                  <Navigation size={16} />
                  Mark In Transit
                </button>
              )}

              {trip.status === "IN_TRANSIT" && (
                <button
                  onClick={() =>
                    router.push(`/driver/trip/${trip.id}`)
                  }
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  View Live Trip
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}