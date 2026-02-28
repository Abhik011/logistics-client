"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import GoogleLocationInput from "@/components/GoogleLocationInput";

export default function TripForm({ onClose }: any) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [startDate, setStartDate] = useState("");

  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");

  const [fromCoords, setFromCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [toCoords, setToCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH DRIVERS ================= */

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get("/drivers");
        setDrivers(res.data || []);
      } catch (err) {
        console.error("Driver fetch failed");
      }
    };

    fetchDrivers();
  }, []);

  const handleDriverChange = async (driverId: string) => {
    try {
      const res = await api.get(`/drivers/${driverId}`);
      setSelectedDriver(res.data);
    } catch (err) {
      console.error("Driver fetch failed");
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedDriver) {
      alert("Please select a driver");
      return;
    }

    if (!fromCoords || !toCoords) {
      alert("Please select valid start and end locations");
      return;
    }

    try {
      setLoading(true);

      await api.post("/trips", {
        driverId: selectedDriver.id,
        startDate,

        startLatitude: fromCoords.latitude,
        startLongitude: fromCoords.longitude,

        endLatitude: toCoords.latitude,
        endLongitude: toCoords.longitude,
      });

      onClose();
    } catch (err) {
      console.error("Trip creation failed");
      alert("Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="w-[480px] bg-white p-6 shadow-2xl overflow-y-auto">
        <h2 className="text-lg font-semibold mb-6">
          Create Trip
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Driver Dropdown */}
          <select
            required
            className="w-full border p-3 rounded-xl"
            onChange={(e) => handleDriverChange(e.target.value)}
          >
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>

          {/* Auto Vehicle Display */}
          <input
            value={
              selectedDriver?.vehicle?.registrationNo || ""
            }
            placeholder="Vehicle Auto Assigned"
            disabled
            className="w-full border p-3 rounded-xl bg-gray-100"
          />

          {/* Start Location */}
          <GoogleLocationInput
            label="Start Location"
            value={startAddress}
            onChange={setStartAddress}
            onSelectLocation={(data: any) => {
              setStartAddress(data.address);
              setFromCoords({
                latitude: data.latitude,
                longitude: data.longitude,
              });
            }}
          />

          {/* End Location */}
          <GoogleLocationInput
            label="End Location"
            value={endAddress}
            onChange={setEndAddress}
            onSelectLocation={(data: any) => {
              setEndAddress(data.address);
              setToCoords({
                latitude: data.latitude,
                longitude: data.longitude,
              });
            }}
          />

          {/* Start Date */}
          <input
            type="date"
            required
            className="w-full border p-3 rounded-xl"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Trip"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}