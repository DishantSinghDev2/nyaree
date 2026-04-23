"use client";
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon paths for leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPickerProps {
  onLocationSelect: (loc: { address: string; city: string; state: string; pincode: string; lat: number; lng: number }) => void;
}

export default function MapPicker({ onLocationSelect }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const addressLine1 = data.name || data.address.road || data.address.suburb || data.address.neighbourhood || "";
        const city = data.address.city || data.address.town || data.address.village || data.address.county || "";
        const state = data.address.state || "";
        const pincode = data.address.postcode || "";
        
        onLocationSelect({
          address: addressLine1,
          city: city,
          state: state,
          pincode: pincode,
          lat,
          lng
        });
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  };

  const initMap = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markerInstance.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);
      
      markerInstance.current.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });
    } else {
      mapInstance.current.setView([lat, lng], 15);
      markerInstance.current?.setLatLng([lat, lng]);
    }
  };

  useEffect(() => {
    // Default to New Delhi if not located yet
    initMap(28.6139, 77.2090);
    
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      initMap(latitude, longitude);
      reverseGeocode(latitude, longitude);
    }, () => {
      alert("Unable to retrieve your location");
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <button 
        type="button" 
        onClick={handleUseMyLocation}
        className="btn btn-outline btn-sm"
        style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px" }}
      >
        <span>📍</span> Use My Location
      </button>
      <div 
        ref={mapRef} 
        style={{ height: "250px", width: "100%", borderRadius: "var(--radius-sm)", zIndex: 1, border: "1px solid var(--color-border)" }} 
      />
      <p style={{ fontSize: "11px", color: "var(--color-ink-light)", marginTop: "-4px" }}>
        Drag the pin to precisely adjust your delivery location.
      </p>
    </div>
  );
}
