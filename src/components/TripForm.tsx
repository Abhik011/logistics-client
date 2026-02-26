"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TripForm({ onClose }: any) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    const fetchDrivers = async () => {
      const res = await api.get("/drivers"); // create this endpoint if not exists
      setDrivers(res.data);
    };

    fetchDrivers();
  }, []);

  const handleDriverChange = async (driverId: string) => {
    const res = await api.get(`/drivers/${driverId}`);
    setSelectedDriver(res.data);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedDriver) return;

    await api.post("/trips", {
      driverId: selectedDriver.id,
      startDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="w-[420px] bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold mb-6">
          Create Trip
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Driver Dropdown */}
          <select
            required
            className="w-full border p-2 rounded-lg"
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
            className="w-full border p-2 rounded-lg bg-gray-100"
          />

          {/* Start Date */}
          <input
            type="date"
            required
            className="w-full border p-2 rounded-lg"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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