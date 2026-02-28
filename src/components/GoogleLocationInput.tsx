"use client";

import { useEffect, useRef } from "react";

export default function GoogleLocationInput({
  label,
  value,
  onChange,
  onSelectLocation,
}: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    const initAutocomplete = () => {
      const google = (window as any).google;

      if (!google || !inputRef.current) return;

      // Prevent multiple initializations
      if (autocompleteRef.current) return;

      autocompleteRef.current =
        new google.maps.places.Autocomplete(inputRef.current, {
          types: ["geocode"],
        });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (!place?.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        onSelectLocation({
          address: place.formatted_address,
          latitude: lat,
          longitude: lng,
        });
      });
    };

    // If script already loaded
    if ((window as any).google) {
      initAutocomplete();
    } else {
      // Wait a bit if script loads slowly
      const interval = setInterval(() => {
        if ((window as any).google) {
          initAutocomplete();
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-500">{label}</label>

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onSelectLocation(null); // Clear coords if user types manually
        }}
        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-violet-500"
        placeholder="Search location..."
      />

      <p className="text-xs text-gray-400">
        Select from dropdown suggestions
      </p>
    </div>
  );
}