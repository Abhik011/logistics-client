"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function VehiclesPage() {

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [form, setForm] = useState({
    registrationNo: "",
    ownership: "OWN",
    capacityTons: "",
    bodyType: "",
    fuelType: "",
    costPerKm: "",
  });

  const fetchVehicles = async () => {
    const res = await axios.get("/api/vehicles");
    setVehicles(res.data);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await axios.post("/api/vehicles", {
      ...form,
      capacityTons: Number(form.capacityTons),
      costPerKm: Number(form.costPerKm),
    });

    setForm({
      registrationNo: "",
      ownership: "OWN",
      capacityTons: "",
      bodyType: "",
      fuelType: "",
      costPerKm: "",
    });

    fetchVehicles();
  };

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-semibold">Vehicle Management</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4 max-w-xl">

        <input
          required
          placeholder="Registration Number"
          className="w-full border p-3 rounded-lg"
          value={form.registrationNo}
          onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
        />

        <select
          className="w-full border p-3 rounded-lg"
          value={form.ownership}
          onChange={(e) => setForm({ ...form, ownership: e.target.value })}
        >
          <option value="OWN">Own</option>
          <option value="MARKET">Market</option>
          <option value="ATTACHED">Attached</option>
        </select>

        <input
          type="number"
          placeholder="Capacity (Tons)"
          className="w-full border p-3 rounded-lg"
          value={form.capacityTons}
          onChange={(e) => setForm({ ...form, capacityTons: e.target.value })}
        />

        <input
          placeholder="Body Type"
          className="w-full border p-3 rounded-lg"
          value={form.bodyType}
          onChange={(e) => setForm({ ...form, bodyType: e.target.value })}
        />

        <input
          placeholder="Fuel Type"
          className="w-full border p-3 rounded-lg"
          value={form.fuelType}
          onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
        />

        <input
          type="number"
          placeholder="Cost Per KM"
          className="w-full border p-3 rounded-lg"
          value={form.costPerKm}
          onChange={(e) => setForm({ ...form, costPerKm: e.target.value })}
        />

        <button
          type="submit"
          className="w-full bg-violet-600 text-white p-3 rounded-xl"
        >
          Register Vehicle
        </button>
      </form>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Reg No</th>
              <th className="p-4 text-left">Ownership</th>
              <th className="p-4 text-left">Capacity</th>
              <th className="p-4 text-left">Cost/KM</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-4">{v.registrationNo}</td>
                <td className="p-4">{v.ownership}</td>
                <td className="p-4">{v.capacityTons}</td>
                <td className="p-4">{v.costPerKm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}