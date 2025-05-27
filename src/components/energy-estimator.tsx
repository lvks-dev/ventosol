"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import L from "leaflet";

const defaultPosition = [-19.8157, -43.9542]; // Belo Horizonte, MG
const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "";

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

export default function EnergyComparison() {
  const [latitude, setLatitude] = useState(defaultPosition[0]);
  const [longitude, setLongitude] = useState(defaultPosition[1]);
  const [area, setArea] = useState(10); // m²
  const [radius, setRadius] = useState(2); // m
  const [uvIndex, setUvIndex] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationLabel, setLocationLabel] = useState("");

  useEffect(() => {
    // This is needed to fix the marker icon issues with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/marker-icon-2x.png",
      iconUrl: "/marker-icon.png",
      shadowUrl: "/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    const fetchClimateData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        const daily = data.daily?.[0];
        if (daily) {
          setUvIndex(daily.uvi);
          setWindSpeed(daily.wind_speed);
        } else {
          setUvIndex(null);
          setWindSpeed(null);
        }
      } catch (err) {
        console.error("Erro ao buscar dados climáticos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClimateData();
  }, [latitude, longitude]);

  const handleAddressSearch = async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
        setLocationLabel(data[0].display_name);
        setError("");
      } else {
        setError("Endereço não encontrado. Tente novamente.");
        setLocationLabel("");
      }
    } catch (err) {
      console.error("Erro ao buscar endereço:", err);
      setError("Erro ao buscar o endereço. Verifique sua conexão.");
    }
  };

  const solarKWh = uvIndex ? uvIndex * area * 0.18 * 30 : 0;
  const windKWh = windSpeed
    ? (0.5 *
        1.225 *
        Math.PI *
        Math.pow(radius, 2) *
        Math.pow(windSpeed, 3) *
        0.4 *
        3600 *
        24 *
        30) /
      1000000
    : 0;

  const economySolar = solarKWh * 0.75;
  const economyWind = windKWh * 0.75;

  return (
    <TooltipProvider>
      <div className="mt-8 space-y-6">
        <h2 className="text-3xl text-center font-bold text-green-800">
          Estimativa de Energia Renovável
        </h2>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-green-800 font-semibold">
            Digite seu endereço:
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddressSearch();
                }
              }}
              placeholder="Ex: Rua A, Cidade, Estado"
            />
            <Button
              onClick={handleAddressSearch}
              className="bg-green-800 hover:bg-green-700 text-white"
            >
              Buscar localização
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          {locationLabel && (
            <p className="text-sm text-gray-600 mt-1">
              Local encontrado: {locationLabel}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Label htmlFor="area" className="text-green-800 font-semibold">
              Área dos painéis (m²):
            </Label>
            <Input
              id="area"
              type="number"
              min="1"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="radius" className="text-green-800 font-semibold">
              Raio da hélice (m):
            </Label>
            <Input
              id="radius"
              type="number"
              min="0.1"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            />
          </div>
        </div>

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

        {loading ? (
          <div className="flex justify-center items-center mt-6 min-h-40">
            <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 border rounded-xl shadow bg-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl text-yellow-700 font-semibold">
                  🌞 Energia Solar
                </h2>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    A geração é estimada com base no índice UV da região
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">
                Irradiação estimada (UVI): {uvIndex ?? "N/D"}
              </p>
              <p className="text-sm text-gray-600">Área: {area} m²</p>
              <p className="text-sm text-gray-600">Eficiência: 18%</p>
              <p className="font-medium">
                Energia estimada mensal: {solarKWh.toFixed(1)} kWh
              </p>
              <p className="font-medium text-green-600">
                Economia estimada: R$ {economySolar.toFixed(2)}
              </p>
            </div>
            <div className="p-4 border rounded-xl shadow bg-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl text-sky-700 font-semibold">
                  🌬️ Energia Eólica
                </h2>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    A geração é estimada com base na velocidade média do vento
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">
                Velocidade do vento: {windSpeed ?? "N/D"} m/s
              </p>
              <p className="text-sm text-gray-600">
                Raio da hélice: {radius} m
              </p>
              <p className="text-sm text-gray-600">
                Eficiência da turbina: 40%
              </p>
              <p className="font-medium">
                Energia estimada mensal: {windKWh.toFixed(1)} kWh
              </p>
              <p className="font-medium text-green-600">
                Economia estimada: R$ {economyWind.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
