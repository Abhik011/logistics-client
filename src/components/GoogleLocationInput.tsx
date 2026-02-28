"use client";

import { useEffect, useRef } from "react";

export default function GoogleLocationInput({
  label,
  value,
  onChange,
  onSelectLocation,
}: any) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  const google = (window as any).google;

if (!google || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current,
      { types: ["geocode"] }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      onSelectLocation({
        address: place.formatted_address,
        latitude: lat,
        longitude: lng,
      });
    });
  }, []);

  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-500">{label}</label>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-3 rounded-xl"
        placeholder="Search location..."
      />
    </div>
  );
}