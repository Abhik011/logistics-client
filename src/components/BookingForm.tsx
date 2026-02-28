"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import GoogleLocationInput from "@/components/GoogleLocationInput";

export default function BookingForm({ onClose }: any) {
  const [customers, setCustomers] = useState<any[]>([]);

  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");

  const [fromCoords, setFromCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [toCoords, setToCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({
    serviceType: "FTL",
    pickupAddress: "",
    deliveryAddress: "",
    weight: "",
    volume: "",
    commodity: "",
    customerId: "",
  });

  /* ================= FETCH CUSTOMERS ================= */

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers");
        setCustomers(res.data.data || []);
      } catch (err) {
        console.error("Customer fetch failed");
      }
    };

    fetchCustomers();
  }, []);

  /* ================= SUBMIT ================= */
const handleSubmit = async (e: any) => {
  e.preventDefault();

  if (!form.customerId) {
    alert("Please select a customer");
    return;
  }
  const google = (window as any).google;
  const geocodeAddress = async (address: string) => {
    return new Promise<{ latitude: number; longitude: number } | null>(
      (resolve) => {
        if (!google) return resolve(null);

        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              latitude: location.lat(),
              longitude: location.lng(),
            });
          } else {
            resolve(null);
          }
        });
      }
    );
  };

  let pickupCoords = fromCoords;
  let deliveryCoords = toCoords;

  // 🔥 Fallback if user typed but didn't select
  if (!pickupCoords && fromAddress) {
    pickupCoords = await geocodeAddress(fromAddress);
  }

  if (!deliveryCoords && toAddress) {
    deliveryCoords = await geocodeAddress(toAddress);
  }

  if (!pickupCoords || !deliveryCoords) {
    alert("Unable to detect location. Please select from suggestions.");
    return;
  }

  try {
    setLoading(true);

    await api.post("/bookings", {
      ...form,

      pickupAddress: fromAddress,
      deliveryAddress: toAddress,

      pickupLatitude: pickupCoords.latitude,
      pickupLongitude: pickupCoords.longitude,

      deliveryLatitude: deliveryCoords.latitude,
      deliveryLongitude: deliveryCoords.longitude,

      weight: Number(form.weight),
      volume: Number(form.volume),
    });

    onClose();
  } catch (err) {
    console.error("Booking creation failed");
    alert("Failed to create booking");
  } finally {
    setLoading(false);
  }
};

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="w-[520px] bg-white p-6 shadow-2xl overflow-y-auto">
        <h2 className="text-lg font-semibold mb-6">
          Create Booking
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CUSTOMER */}
          <select
            required
            className="w-full border p-3 rounded-xl"
            value={form.customerId}
            onChange={(e) =>
              setForm({ ...form, customerId: e.target.value })
            }
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* FROM LOCATION */}
          <GoogleLocationInput
            label="Pickup Location"
            value={fromAddress}
            onChange={setFromAddress}
            onSelectLocation={(data: any) => {
              setFromAddress(data.address);
              setFromCoords({
                latitude: data.latitude,
                longitude: data.longitude,
              });
            }}
          />

          {/* TO LOCATION */}
          <GoogleLocationInput
            label="Delivery Location"
            value={toAddress}
            onChange={setToAddress}
            onSelectLocation={(data: any) => {
              setToAddress(data.address);
              setToCoords({
                latitude: data.latitude,
                longitude: data.longitude,
              });
            }}
          />

          {/* WEIGHT */}
          <input
            type="number"
            placeholder="Weight (kg)"
            className="w-full border p-3 rounded-xl"
            value={form.weight}
            onChange={(e) =>
              setForm({ ...form, weight: e.target.value })
            }
            required
          />

          {/* VOLUME */}
          <input
            type="number"
            placeholder="Volume (CBM)"
            className="w-full border p-3 rounded-xl"
            value={form.volume}
            onChange={(e) =>
              setForm({ ...form, volume: e.target.value })
            }
            required
          />

          {/* COMMODITY */}
          <input
            placeholder="Commodity"
            className="w-full border p-3 rounded-xl"
            value={form.commodity}
            onChange={(e) =>
              setForm({ ...form, commodity: e.target.value })
            }
            required
          />

          {/* ACTION BUTTONS */}
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
              {loading ? "Creating..." : "Create Booking"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}