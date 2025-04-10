"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";

interface LeafletMapProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    name: string;
    type: string;
  }) => void;
  centerLocation: { lat: number; lng: number } | null;
}

// Component to handle map click events
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: LeafletMapProps["onLocationSelect"];
}) {
  const map = useMap();
  const mapClickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(
    null
  );

  useEffect(() => {
    if (!map) return;

    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      try {
        // Use reverse geocoding to get location information
        // In a real app, you would use a service like Nominatim, Google Geocoding API, etc.
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
        );
        const data = await response.json();

        // Determine terrain type based on OSM data
        // This is a simplified example - you would need more sophisticated logic in a real app
        let terrainType = "temperate";
        if (data.address) {
          if (
            data.address.natural === "beach" ||
            data.address.natural === "coastline"
          ) {
            terrainType = "coastal";
          } else if (
            data.address.natural === "mountain" ||
            data.address.natural === "peak"
          ) {
            terrainType = "mountains";
          } else if (data.address.landuse === "forest") {
            terrainType = "forest";
          } else if (data.address.place === "city") {
            terrainType = "urban";
          } else if (data.address.place === "suburb") {
            terrainType = "suburban";
          }
          // Add more terrain type detection logic as needed
        }

        onLocationSelect({
          lat,
          lng,
          name:
            data.display_name ||
            `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          type: terrainType,
        });
      } catch (error) {
        console.error("Error fetching location data:", error);
        // Fallback if geocoding fails
        onLocationSelect({
          lat,
          lng,
          name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          type: "temperate",
        });
      }
    };

    mapClickHandlerRef.current = handleMapClick;
  }, [map, onLocationSelect]);

  useEffect(() => {
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (mapClickHandlerRef.current) {
        mapClickHandlerRef.current(e);
      }
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map]);

  return null;
}

export default function LeafletMap({ onLocationSelect }: LeafletMapProps) {
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null);

  useEffect(() => {
    // This is needed to fix the marker icon issues with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/marker-icon-2x.png",
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
    });
  }, []);

  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    name: string;
    type: string;
  }) => {
    setSelectedPosition([location.lat, location.lng]);
    onLocationSelect(location);
  };

  return (
    <Card className="border-green-200 overflow-hidden">
      <div className="h-[400px] w-full">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />

          {selectedPosition && (
            <Marker position={selectedPosition}>
              <Popup>
                Localização selecionada
                <br />
                Lat: {selectedPosition[0].toFixed(4)}, Lng:{" "}
                {selectedPosition[1].toFixed(4)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </Card>
  );
}
