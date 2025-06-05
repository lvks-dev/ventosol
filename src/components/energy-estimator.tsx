"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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

const LeafletMap = dynamic(() => import("@/components/leaflet"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-md">
      <div className="animate-pulse text-gray-500">Loading map...</div>
    </div>
  ),
});

function dynamicSolarEfficiency(uvIndex: number | null): number {
  if (!uvIndex) return 0;
  if (uvIndex > 10) return 0.21;
  if (uvIndex > 7) return 0.19;
  if (uvIndex > 4) return 0.17;
  return 0.15;
}

function dynamicWindEfficiency(windSpeed: number | null): number {
  if (!windSpeed) return 0;
  if (windSpeed > 10) return 0.45;
  if (windSpeed > 6) return 0.4;
  if (windSpeed > 3) return 0.35;
  return 0.2;
}

function calculateSolarKWh(uvIndex: number | null, area: number): number {
  const eff = dynamicSolarEfficiency(uvIndex);
  return uvIndex ? uvIndex * area * eff * 30 : 0;
}

function calculateWindKWh(windSpeed: number | null, radius: number): number {
  const eff = dynamicWindEfficiency(windSpeed);
  return windSpeed
    ? (0.5 *
        1.225 *
        Math.PI *
        Math.pow(radius, 2) *
        Math.pow(windSpeed, 3) *
        eff *
        3600 *
        24 *
        30) /
        1000000
    : 0;
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
  const [consumption, setConsumption] = useState(150); // kWh, valor fixo para simplificação
  const [costKWh, setCostKWh] = useState(0.75); // kWh, valor fixo para simplificação
  const [costSolar, setCostSolar] = useState(20000); // R$, valor fixo para simplificação
  const [costWind, setCostWind] = useState(25000); // R$, valor fixo para simplificação

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

  // const solarKWhPrice = 0.25;
  // const windKWhPrice = 0.5;

  const solarKWh = calculateSolarKWh(uvIndex, area);
  const windKWh = calculateWindKWh(windSpeed, radius);

  const economySolar = solarKWh * costKWh;
  const economyWind = windKWh * costKWh;

  // const valueGeneratedSolar = solarKWh * solarKWhPrice;
  // const valueGeneratedWind = windKWh * windKWhPrice;

  const monthlyCost = consumption * costKWh;
  const paybackSolar = solarKWh > 0 ? costSolar / economySolar : null;
  const paybackWind = windKWh > 0 ? costWind / economyWind : null;
  const coverageSolar = Math.min(100, (solarKWh / consumption) * 100);
  const coverageWind = Math.min(100, (windKWh / consumption) * 100);

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

          <div className="space-y-2">
            <Label
              htmlFor="consumption"
              className="text-green-800 font-semibold"
            >
              Consumo mensal (kWh):
            </Label>
            <Input
              id="consumption"
              type="number"
              min="0"
              value={consumption}
              onChange={(e) => setConsumption(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costKWh" className="text-green-800 font-semibold">
              Custo por kWh (R$):
            </Label>
            <Input
              id="costKWh"
              type="number"
              min="0"
              value={costKWh}
              onChange={(e) => setCostKWh(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costKWh" className="text-green-800 font-semibold">
              Custo de instalação solar (R$):
            </Label>
            <Input
              id="costKWh"
              type="number"
              min="0"
              value={costSolar}
              onChange={(e) => setCostSolar(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costKWh" className="text-green-800 font-semibold">
              Custo de instalação eólica (R$):
            </Label>
            <Input
              id="costKWh"
              type="number"
              min="0"
              value={costWind}
              onChange={(e) => setCostWind(Number(e.target.value))}
            />
          </div>
        </div>

        <LeafletMap
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          setLocationLabel={setLocationLabel}
        />

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
              <p className="text-sm text-gray-600">
                Eficiência: {dynamicSolarEfficiency(uvIndex) * 100}%
              </p>
              <p className="text-sm text-gray-600">
                Gasto mensal atual: R$ {monthlyCost.toFixed(2)}
              </p>
              <p className="font-medium">
                Energia estimada mensal: {solarKWh.toFixed(1)} kWh
              </p>
              <p className="font-medium text-green-600">
                Economia estimada: R$ {economySolar.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Custo estimado da instalação: R$ {costSolar.toFixed(2)}
              </p>
              {paybackSolar !== null ? (
                <p className="text-sm text-gray-600">
                  Retorno estimado: {paybackSolar.toFixed(1)} meses
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Geração insuficiente para calcular o retorno
                </p>
              )}
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
                Eficiência da turbina: {dynamicWindEfficiency(windSpeed) * 100}%
              </p>
              <p className="text-sm text-gray-600">
                Gasto mensal atual: R$ {monthlyCost.toFixed(2)}
              </p>
              <p className="font-medium">
                Energia estimada mensal: {windKWh.toFixed(1)} kWh
              </p>
              <p className="font-medium text-green-600">
                Economia estimada: R$ {economyWind.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Custo estimado da instalação: R$ {costWind.toFixed(2)}
              </p>
              {paybackWind !== null ? (
                <p className="text-sm text-gray-600">
                  Retorno estimado: {paybackWind.toFixed(1)} meses
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Geração insuficiente para calcular o retorno
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-10 p-6 border rounded-xl shadow bg-gray-50">
        <h3 className="text-2xl font-bold text-green-800 mb-4">
          📊 Resumo da Situação Atual
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <p>
              <strong>Consumo mensal informado:</strong> {consumption} kWh
            </p>
            <p>
              <strong>Custo por kWh:</strong> R$ {costKWh.toFixed(2)}
            </p>
            <p>
              <strong>Custo atual mensal:</strong> R$ {monthlyCost.toFixed(2)}
            </p>
          </div>
          <div>
            <p>
              <strong>Economia com solar:</strong> R$ {economySolar.toFixed(2)}
            </p>
            <p>
              <strong>Economia com eólica:</strong> R$ {economyWind.toFixed(2)}
            </p>
            <p>
              <strong>% de cobertura solar:</strong> {coverageSolar.toFixed(1)}%
            </p>
            <p>
              <strong>% de cobertura eólica:</strong> {coverageWind.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
