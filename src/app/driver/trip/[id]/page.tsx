"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Fuel, UploadCloud, CheckCircle } from "lucide-react";

export default function TripPage() {
    const params = useParams();
    const tripId = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const [tracking, setTracking] = useState(false);
    const [tripStatus, setTripStatus] = useState("ONGOING");

    const [fuellitres, setFuellitres] = useState("");
    const [fuelCost, setFuelCost] = useState("");
    const [fuelReceipt, setFuelReceipt] = useState<File | null>(null);

    const [totallitres, setTotallitres] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    const [fuelSuccess, setFuelSuccess] = useState(false);

    const [file, setFile] = useState<File | null>(null);

    const lastLocationRef = useRef<{
        latitude: number;
        longitude: number;
    } | null>(null);

    /* ================= DISTANCE CALC ================= */
    const getDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) => {
        const R = 6371000;
        const toRad = (val: number) => (val * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    /* ================= FETCH TRIP ================= */
    useEffect(() => {
        if (!tripId) return;

        const token = localStorage.getItem("token");

        const fetchTrip = async () => {
            try {
                const res = await axios.get(
                    `/api/trips/${tripId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

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

                if (!lastLocationRef.current) {
                    lastLocationRef.current = { latitude, longitude };
                    setTracking(true);
                    return;
                }

                const last = lastLocationRef.current;

                const distance = getDistance(
                    last.latitude,
                    last.longitude,
                    latitude,
                    longitude
                );

                if (distance > 10) {
                    await axios.patch(
                        `/api/trips/${tripId}/location`,
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

    /* ================= FUEL SUBMIT ================= */
    const submitFuel = async () => {
        if (!fuellitres || !fuelCost) return;

        const token = localStorage.getItem("driver_token");

        try {
            await axios.post(
                `/api/trips/${tripId}/fuel`,
                {
                    litres: Number(fuellitres),
                    amount: Number(fuelCost),   // ✅ correct field
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

    const costPerLiter =
        fuellitres && fuelCost
            ? (Number(fuelCost) / Number(fuellitres)).toFixed(2)
            : "0";

    /* ================= POD ================= */
    const uploadPod = async () => {
        if (!file) return;

        const token = localStorage.getItem("driver_token");
        const formData = new FormData();
        formData.append("file", file);

        await axios.post(
            `/api/driver/trip/${tripId}/pod`,
            formData,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        alert("POD uploaded successfully");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-6 space-y-6">

            {/* ================= TRACKING ================= */}
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                <h1 className="text-lg font-semibold">
                    Live Trip Tracking
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {tracking
                        ? "GPS tracking active"
                        : "Connecting to GPS..."}
                </p>
            </div>

            {/* ================= FUEL ENTRY ================= */}
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-4">
                <h2 className="font-semibold text-lg">
                    Fuel Entry
                </h2>

                <input
                    type="number"
                    placeholder="Total Fuel (litres)"
                    value={fuellitres}
                    onChange={(e) => setFuellitres(e.target.value)}
                    className="w-full border p-3 rounded-xl"
                />

                <input
                    type="number"
                    placeholder="Total Fuel Cost (₹)"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full border p-3 rounded-xl"
                />

                {/* Auto Cost Per Liter */}
                <div className="text-sm text-gray-600">
                    Cost per Liter: ₹ {costPerLiter}
                </div>

                {/* Receipt Upload */}
                <input
                    type="file"
                    onChange={(e) =>
                        setFuelReceipt(e.target.files?.[0] || null)
                    }
                    className="border p-3 rounded-xl w-full"
                />

                <button
                    onClick={submitFuel}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl hover:opacity-90 transition"
                >
                    <Fuel size={16} />
                    Add Fuel
                </button>

                {/* Animated Success */}
                {fuelSuccess && (
                    <div className="flex items-center gap-2 text-green-600 animate-pulse">
                        <CheckCircle size={18} />
                        Fuel Added Successfully
                    </div>
                )}
            </div>

            {/* ================= FUEL SUMMARY ================= */}
            <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-2">
                <h2 className="font-semibold text-lg">
                    Fuel Summary
                </h2>
                <p>Total litres: {totallitres} L</p>
                <p>Total Cost: ₹ {totalCost}</p>
            </div>

            {/* ================= POD AFTER DELIVERY ================= */}
            {tripStatus === "DELIVERED" && (
                <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 space-y-4">
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
                        className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white rounded-xl hover:opacity-90 transition"
                    >
                        <UploadCloud size={16} />
                        Upload POD
                    </button>
                </div>
            )}
        </div>
    );
}