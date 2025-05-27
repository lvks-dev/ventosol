import React, { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

function LocationMarker({
  onSelect,
}: {
  onSelect: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });
  return null;
}

interface MapProps {
  latitude: number;
  longitude: number;
  setLatitude: (lat: number) => void;
  setLongitude: (lon: number) => void;
  setLocationLabel: (label: string) => void;
}

export default function Map({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  setLocationLabel,
}: MapProps) {
  useEffect(() => {
    // This is needed to fix the marker icon issues with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/marker-icon-2x.png",
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={10}
      style={{ height: "300px" }}
      className="rounded-xl overflow-hidden"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]} />
      <LocationMarker
        onSelect={(lat, lon) => {
          setLatitude(lat);
          setLongitude(lon);
          setLocationLabel("");
        }}
      />
    </MapContainer>
  );
}
