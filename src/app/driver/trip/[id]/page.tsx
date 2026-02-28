"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Fuel, UploadCloud, CheckCircle } from "lucide-react";

export default function TripPage() {
  const params = useParams();
  const tripId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [tracking, setTracking] = useState(false);
  const [tripStatus, setTripStatus] = useState("ONGOING");

  const [fuellitres, setFuellitres] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [fuelSuccess, setFuelSuccess] = useState(false);

  const [totallitres, setTotallitres] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const [file, setFile] = useState<File | null>(null);

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const lastLocationRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [completed, setCompleted] = useState(false);

  /* ================= FETCH TRIP ================= */
  useEffect(() => {
    if (!tripId) return;
    const token = localStorage.getItem("token");

    const fetchTrip = async () => {
      try {
        const res = await axios.get(`/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTripStatus(res.data.status);

        const totalLitres =
          res.data.fuelEntries?.reduce(
            (sum: number, f: any) => sum + f.litres,
            0
          ) || 0;

        const totalAmount =
          res.data.fuelEntries?.reduce(
            (sum: number, f: any) => sum + f.amount,
            0
          ) || 0;

        setTotallitres(totalLitres);
        setTotalCost(totalAmount);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTrip();
  }, [tripId]);

  /* ================= GPS TRACKING ================= */
  useEffect(() => {
    if (!tripId) return;

    const token = localStorage.getItem("driver_token");

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        setCurrentLocation({ latitude, longitude });

        try {
          await axios.post(
            `/api/driver/trip/${tripId}/location`,
            {
              latitude,
              longitude,
              speed: pos.coords.speed ?? 0,
              heading: pos.coords.heading ?? 0,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          lastLocationRef.current = { latitude, longitude };
          setTracking(true);
        } catch (err) {
          console.log("Location update failed", err);
        }
      },
      () => setTracking(false),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [tripId]);

  /* ================= COMPLETE TRIP SLIDE ================= */
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!sliderRef.current || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();

    let newLeft = touch.clientX - rect.left - 30;

    if (newLeft < 0) newLeft = 0;
    if (newLeft > rect.width - 60)
      newLeft = rect.width - 60;

    sliderRef.current.style.left = `${newLeft}px`;

    if (newLeft >= rect.width - 65) {
      completeTrip();
    }
  };

  const completeTrip = async () => {
    if (completed) return;

    const token = localStorage.getItem("driver_token");

    await axios.patch(
      `/api/driver/trip/${tripId}/status`,
      { status: "COMPLETED" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setCompleted(true);
  };

  /* ================= FUEL ================= */
  const submitFuel = async () => {
    if (!fuellitres || !fuelCost) return;

    const token = localStorage.getItem("driver_token");

    try {
      await axios.post(
        `/api/trips/${tripId}/fuel`,
        {
          litres: Number(fuellitres),
          amount: Number(fuelCost),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTotallitres((prev) => prev + Number(fuellitres));
      setTotalCost((prev) => prev + Number(fuelCost));

      setFuellitres("");
      setFuelCost("");

      setFuelSuccess(true);
      setTimeout(() => setFuelSuccess(false), 2500);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= POD ================= */
  const uploadPod = async () => {
    if (!file) return;

    const token = localStorage.getItem("driver_token");
    const formData = new FormData();
    formData.append("file", file);

    await axios.post(`/api/driver/trip/${tripId}/pod`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("POD uploaded successfully");
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-6 space-y-6">

      {/* TRACKING STATUS */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h1 className="text-lg font-semibold">
          Live Trip Tracking
        </h1>

        <div className="flex items-center gap-2 mt-2">
          <div
            className={`w-3 h-3 rounded-full ${tracking
                ? "bg-green-500 animate-ping"
                : "bg-red-500"
              }`}
          />
          <p className="text-sm text-gray-600">
            {tracking
              ? "Live Tracking Active"
              : "Waiting for GPS..."}
          </p>
        </div>
      </div>

      {/* DRIVER LIVE MAP */}
      {currentLocation && (
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <iframe
            width="100%"
            height="300"
            loading="lazy"
            src={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}&z=15&output=embed`}
          />
        </div>
      )}

      {/* SLIDE TO COMPLETE */}
      {!completed && tripStatus !== "COMPLETED" && (
        <div
          ref={containerRef}
          className="relative h-14 bg-gray-200 rounded-full overflow-hidden"
        >
          <div
            ref={sliderRef}
            onTouchMove={handleTouchMove}
            className="absolute left-0 top-0 h-14 w-14 bg-green-600 rounded-full flex items-center justify-center text-white font-bold transition-all"
          >
            →
          </div>

          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm pointer-events-none">
            Slide to Complete Trip
          </div>
        </div>
      )}

      {completed && (
        <div className="text-center text-green-600 font-semibold">
          Trip Completed Successfully ✓
        </div>
      )}

      {/* FUEL ENTRY */}
      <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
        <h2 className="font-semibold text-lg">
          Fuel Entry
        </h2>

        <input
          type="number"
          placeholder="Total Fuel (litres)"
          value={fuellitres}
          onChange={(e) =>
            setFuellitres(e.target.value)
          }
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="number"
          placeholder="Total Fuel Cost (₹)"
          value={fuelCost}
          onChange={(e) =>
            setFuelCost(e.target.value)
          }
          className="w-full border p-3 rounded-xl"
        />

        <button
          onClick={submitFuel}
          className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl"
        >
          <Fuel size={16} />
          Add Fuel
        </button>

        {fuelSuccess && (
          <div className="flex items-center gap-2 text-green-600 animate-pulse">
            <CheckCircle size={18} />
            Fuel Added Successfully
          </div>
        )}
      </div>

      {/* POD */}
      {tripStatus === "COMPLETED" && (
        <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
          <h2 className="font-semibold text-lg">
            Upload POD
          </h2>

          <input
            type="file"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
            className="border p-3 rounded-xl w-full"
          />

          <button
            onClick={uploadPod}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white rounded-xl"
          >
            <UploadCloud size={16} />
            Upload POD
          </button>
        </div>
      )}
    </div>
  );
}