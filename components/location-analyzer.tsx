"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Wind, Sun, Compass, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";

// Import Leaflet map with no SSR since Leaflet requires window object
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-md">
      <div className="animate-pulse text-gray-500">Carregando mapa...</div>
    </div>
  ),
});

// Base wind potential values for each terrain type
// These will be modified by location factors
const BASE_WIND_POTENTIAL = {
  // Coastal areas have excellent wind resources due to sea breezes and unobstructed wind flow
  coastal: {
    base: 85,
    description:
      " Excelente devido às brisas marítimas constantes e ao fluxo de vento desobstruído",
  },

  // Mountains have very high wind potential due to pressure gradients and funneling effects
  mountains: {
    base: 90,
    description:
      "Muito alto devido aos gradientes de pressão e ao funilamento do vento através de passagens",
  },

  // Plains have good wind potential due to unobstructed terrain
  plains: {
    base: 75,
    description:
      "Bom devido ao terreno desobstruído e padrões de vento consistentes",
  },

  // Desert regions can have moderate to good wind, especially at night due to temperature differentials
  desert: {
    base: 65,
    description:
      "Moderado a bom, especialmente à noite devido às diferenças de temperatura",
  },

  // Arctic regions have strong winds but extreme conditions affect turbine operation
  arctic: {
    base: 80,
    description:
      "Ventos fortes, mas as condições extremas podem limitar a operação das turbinas",
  },

  // Temperate regions have moderate wind potential
  temperate: {
    base: 60,
    description:
      "Moderado, com padrões de vento variáveis conforme as estações",
  },

  // Tropical regions have moderate wind potential but can be affected by seasonal patterns
  tropical: {
    base: 55,
    description: "Moderado, mas afetado por monções sazonais e ventos alísios",
  },

  // Suburban areas have reduced wind potential due to buildings and structures
  suburban: {
    base: 40,
    description:
      "Reduzido devido a edifícios e estruturas que criam turbulência",
  },

  // Forests have low wind potential due to trees blocking and disrupting wind flow
  forest: {
    base: 30,
    description:
      "Baixo devido às árvores bloqueando e perturbando o fluxo de vento",
  },

  // Urban areas have the lowest wind potential due to buildings creating turbulence and blocking wind
  urban: {
    base: 25,
    description:
      "Muito baixo devido a edifícios que criam turbulência e bloqueiam o vent",
  },
};

// Base solar potential values for each terrain type
// These will be modified by latitude
const BASE_SOLAR_POTENTIAL = {
  // Desert regions have the highest solar potential due to clear skies and high insolation
  desert: {
    base: 95,
    description:
      "Excelente devido aos céus limpos e alta incidência de luz solar direta",
  },

  // Tropical regions have high potential but can be affected by cloud cover
  tropical: {
    base: 85,
    description:
      "Muito bom, mas pode ser afetado por cobertura de nuvens e chuvas sazonais",
  },

  // Coastal areas can have good solar potential but may be affected by fog and marine layers
  coastal: {
    base: 75,
    description:
      "Bom, mas pode ser afetado por neblina e camadas marinhas em algumas regiões",
  },

  // Plains typically have good solar exposure
  plains: {
    base: 80,
    description: "Boa exposição solar com obstruções mínimas",
  },

  // Suburban areas have decent solar potential with some shading issues
  suburban: {
    base: 70,
    description: "Razoável, com alguma sombra de edifícios e árvores",
  },

  // Temperate regions have moderate solar potential with seasonal variations
  temperate: {
    base: 65,
    description: "Moderado, com variações sazonais significativas",
  },

  // Urban areas have reduced potential due to air pollution and building shadows
  urban: {
    base: 60,
    description: "Reduzido devido à poluição do ar e sombras de prédios altos",
  },

  // Mountain regions have variable potential depending on orientation and cloud cover
  mountains: {
    base: 70,
    description:
      "Variável, dependendo da orientação do relevo e da cobertura de nuvens",
  },

  // Forests have reduced solar potential due to tree cover
  forest: {
    base: 50,
    description: "Limitado devido à sombra da copa das árvores",
  },

  // Arctic regions have very low solar potential due to low sun angles and long periods of darkness
  arctic: {
    base: 35,
    description:
      "Muito baixo devido ao ângulo baixo do sol e longos períodos de escuridão",
  },
};

// In a real app, you would fetch this data from an API
const SAMPLE_LOCATIONS = [
  { name: "Sahara Desert, Algeria", lat: 27.1258, lng: 2.4519, type: "desert" },
  {
    name: "San Francisco Bay, USA",
    lat: 37.8199,
    lng: -122.4783,
    type: "coastal",
  },
  {
    name: "Swiss Alps, Switzerland",
    lat: 46.8182,
    lng: 8.2275,
    type: "mountains",
  },
  { name: "Great Plains, USA", lat: 41.5, lng: -99.8, type: "plains" },
  {
    name: "Amazon Rainforest, Brazil",
    lat: -3.4653,
    lng: -62.2159,
    type: "forest",
  },
  {
    name: "Manhattan, New York, USA",
    lat: 40.7831,
    lng: -73.9712,
    type: "urban",
  },
  {
    name: "Palo Alto, California, USA",
    lat: 37.4419,
    lng: -122.143,
    type: "suburban",
  },
  { name: "Bali, Indonesia", lat: -8.3405, lng: 115.092, type: "tropical" },
  { name: "Svalbard, Norway", lat: 78.6569, lng: 16.35, type: "arctic" },
  { name: "Tuscany, Italy", lat: 43.7711, lng: 11.2486, type: "temperate" },
];

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  type: keyof typeof BASE_WIND_POTENTIAL;
  solarScore?: number;
  windScore?: number;
  solarDescription?: string;
  windDescription?: string;
  windFactors?: {
    latitude: number;
    altitude: number;
    coastal: number;
    seasonal: number;
  };
  recommendation?: "solar" | "wind" | "both";
}

export default function LocationAnalyzer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Filter suggestions based on search term
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 2) {
      const filtered = SAMPLE_LOCATIONS.filter((location) =>
        location.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered as LocationData[]);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle search submission
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length < 3) return;

    try {
      // In a real app, you would use a geocoding service like Nominatim, Google Geocoding API, etc.
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // Get the first result
        const result = data[0];

        // Determine terrain type based on OSM data
        // This is simplified - you would need more sophisticated logic in a real app
        let terrainType = "temperate";

        // You would analyze the OSM data to determine terrain type
        // For now, we'll use a simple heuristic based on the display name
        const displayName = result.display_name.toLowerCase();
        if (displayName.includes("desert") || displayName.includes("sahara")) {
          terrainType = "desert";
        } else if (
          displayName.includes("coast") ||
          displayName.includes("beach") ||
          displayName.includes("bay")
        ) {
          terrainType = "coastal";
        } else if (
          displayName.includes("mountain") ||
          displayName.includes("alps") ||
          displayName.includes("peak")
        ) {
          terrainType = "mountains";
        } else if (
          displayName.includes("forest") ||
          displayName.includes("woods")
        ) {
          terrainType = "forest";
        } else if (
          displayName.includes("city") ||
          displayName.includes("downtown")
        ) {
          terrainType = "urban";
        }

        const lat = Number.parseFloat(result.lat);
        const lng = Number.parseFloat(result.lon);

        // Center the map on the searched location
        setMapCenter({ lat, lng });

        handleLocationSelect({
          lat,
          lng,
          name: result.display_name,
          type: terrainType as keyof typeof BASE_WIND_POTENTIAL,
        });
      }
    } catch (error) {
      console.error("Error searching for location:", error);
    }
  };

  // Calculate distance to nearest coast (simplified)
  // In a real app, you would use a more sophisticated method with actual coastline data
  const calculateCoastalProximity = (lat: number, lng: number): number => {
    // Simplified coastal regions (major coastlines approximated)
    const coastalPoints = [
      // North America West Coast
      { lat: 37.7749, lng: -122.4194 }, // San Francisco
      { lat: 34.0522, lng: -118.2437 }, // Los Angeles
      { lat: 47.6062, lng: -122.3321 }, // Seattle

      // North America East Coast
      { lat: 40.7128, lng: -74.006 }, // New York
      { lat: 42.3601, lng: -71.0589 }, // Boston
      { lat: 25.7617, lng: -80.1918 }, // Miami

      // Europe
      { lat: 51.5074, lng: -0.1278 }, // London
      { lat: 41.9028, lng: 12.4964 }, // Rome
      { lat: 55.6761, lng: 12.5683 }, // Copenhagen

      // Asia
      { lat: 35.6762, lng: 139.6503 }, // Tokyo
      { lat: 22.3193, lng: 114.1694 }, // Hong Kong
      { lat: 1.3521, lng: 103.8198 }, // Singapore

      // Australia
      { lat: -33.8688, lng: 151.2093 }, // Sydney
      { lat: -37.8136, lng: 144.9631 }, // Melbourne

      // South America
      { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
      { lat: -12.0464, lng: -77.0428 }, // Lima
    ];

    // Find minimum distance to any coastal point
    let minDistance = Number.MAX_VALUE;
    for (const point of coastalPoints) {
      // Simple Euclidean distance (not accurate for long distances on Earth but sufficient for our demo)
      const distance = Math.sqrt(
        Math.pow((lat - point.lat) * 111, 2) +
          Math.pow((lng - point.lng) * 111 * Math.cos((lat * Math.PI) / 180), 2)
      );
      minDistance = Math.min(minDistance, distance);
    }

    // Convert distance to a 0-100 score (closer to coast = higher score)
    // 0km = 100%, 1000km = 0%
    const coastalFactor = Math.max(0, 100 - minDistance / 10);
    return coastalFactor;
  };

  // Estimate altitude based on terrain type and location (simplified)
  // In a real app, you would use elevation data from a GIS service
  const estimateAltitude = (
    lat: number,
    lng: number,
    terrainType: string
  ): number => {
    // Base altitude estimate by terrain type (meters)
    const baseAltitudes: Record<string, number> = {
      mountains: 2000,
      plains: 500,
      desert: 800,
      coastal: 50,
      forest: 600,
      urban: 100,
      suburban: 150,
      tropical: 300,
      arctic: 400,
      temperate: 300,
    };

    // Add some variation based on latitude and longitude
    // This is just to simulate different locations having different altitudes
    const latFactor = Math.sin(lat * 0.1) * 300;
    const lngFactor = Math.cos(lng * 0.1) * 300;

    const estimatedAltitude =
      baseAltitudes[terrainType] + latFactor + lngFactor;

    // Convert altitude to a 0-100 score (higher altitude = higher score, up to a point)
    // 0m = 0%, 3000m = 100%, >3000m starts to decrease
    let altitudeFactor;
    if (estimatedAltitude <= 3000) {
      altitudeFactor = (estimatedAltitude / 3000) * 100;
    } else {
      // Very high altitudes have less wind potential due to air density
      altitudeFactor = 100 - ((estimatedAltitude - 3000) / 2000) * 30;
    }

    return Math.min(100, Math.max(0, altitudeFactor));
  };

  // Calculate seasonal wind factor based on latitude
  const calculateSeasonalWindFactor = (lat: number): number => {
    // Wind patterns vary by latitude:
    // - Mid-latitudes (30-60°N/S): Strong seasonal variations with jet streams
    // - Tropics (0-30°N/S): More consistent trade winds
    // - Polar regions (60-90°N/S): Strong but variable winds

    const absLat = Math.abs(lat);

    if (absLat < 30) {
      // Tropical regions: more consistent winds (trade winds)
      return 70 + (absLat / 30) * 20;
    } else if (absLat < 60) {
      // Mid-latitudes: highest seasonal variations with jet streams
      return 80 + ((absLat - 30) / 30) * 15;
    } else {
      // Polar regions: strong but highly variable winds
      return 90 - ((absLat - 60) / 30) * 10;
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: {
    lat: number;
    lng: number;
    name: string;
    type: string;
  }) => {
    const terrainType = location.type as keyof typeof BASE_WIND_POTENTIAL;

    // Get base wind potential for this terrain type
    const baseWindData =
      BASE_WIND_POTENTIAL[terrainType] || BASE_WIND_POTENTIAL.temperate;

    // Calculate wind factors based on location
    const latitudeFactor = calculateSeasonalWindFactor(location.lat);
    const altitudeFactor = estimateAltitude(
      location.lat,
      location.lng,
      terrainType
    );
    const coastalFactor = calculateCoastalProximity(location.lat, location.lng);
    const seasonalFactor = Math.abs(location.lat) > 30 ? 85 : 70; // Higher latitudes have more seasonal variation

    // Combine factors with appropriate weights based on terrain type
    let windFactorWeights;

    switch (terrainType) {
      case "coastal":
        windFactorWeights = {
          latitude: 0.2,
          altitude: 0.1,
          coastal: 0.6,
          seasonal: 0.1,
        };
        break;
      case "mountains":
        windFactorWeights = {
          latitude: 0.2,
          altitude: 0.6,
          coastal: 0.1,
          seasonal: 0.1,
        };
        break;
      case "plains":
        windFactorWeights = {
          latitude: 0.4,
          altitude: 0.2,
          coastal: 0.2,
          seasonal: 0.2,
        };
        break;
      case "desert":
        windFactorWeights = {
          latitude: 0.3,
          altitude: 0.3,
          coastal: 0.2,
          seasonal: 0.2,
        };
        break;
      case "arctic":
        windFactorWeights = {
          latitude: 0.5,
          altitude: 0.2,
          coastal: 0.1,
          seasonal: 0.2,
        };
        break;
      default:
        windFactorWeights = {
          latitude: 0.3,
          altitude: 0.2,
          coastal: 0.3,
          seasonal: 0.2,
        };
    }

    // Calculate combined wind factor
    const combinedWindFactor =
      latitudeFactor * windFactorWeights.latitude +
      altitudeFactor * windFactorWeights.altitude +
      coastalFactor * windFactorWeights.coastal +
      seasonalFactor * windFactorWeights.seasonal;

    // Apply the combined factor to the base wind potential
    // We use a weighted approach to ensure terrain type remains the primary factor
    const windScore = Math.round(
      baseWindData.base * 0.7 + combinedWindFactor * 0.3
    );

    // Store the individual factors for display
    const windFactors = {
      latitude: latitudeFactor,
      altitude: altitudeFactor,
      coastal: coastalFactor,
      seasonal: seasonalFactor,
    };

    // Create a custom wind description that includes location factors
    let windDescription = baseWindData.description;

    // Add location-specific details
    if (coastalFactor > 70) {
      windDescription += ". A proximidade da costa aumenta o potencial eólico";
    }
    if (altitudeFactor > 70) {
      windDescription += ". A elevação contribui para ventos mais fortes";
    }
    if (Math.abs(location.lat) > 45) {
      windDescription +=
        ". A latitude elevada cria ventos mais fortes, mas mais sazonais";
    }

    // Calculate solar score based on latitude and terrain
    const baseSolarData =
      BASE_SOLAR_POTENTIAL[terrainType] || BASE_SOLAR_POTENTIAL.temperate;

    // Calculate latitude factor for solar
    const absLat = Math.abs(location.lat);
    const cosFactor = Math.cos(absLat * (Math.PI / 180));
    const seasonalSolarFactor = 1 - (absLat / 90) * 0.3;
    const dayLengthFactor = 1 - (absLat / 90) * 0.2;
    const latitudeFactorSolar =
      (cosFactor * 0.6 + seasonalSolarFactor * 0.25 + dayLengthFactor * 0.15) *
      30;

    // Apply latitude adjustment to base solar potential
    const solarScore = Math.min(
      100,
      Math.max(0, baseSolarData.base + latitudeFactorSolar - absLat * 0.3)
    );
    const solarDescription = baseSolarData.description;

    // Determine recommendation
    let recommendation: "solar" | "wind" | "both" = "both";
    if (solarScore > windScore + 15) {
      recommendation = "solar";
    } else if (windScore > solarScore + 15) {
      recommendation = "wind";
    }

    // Center the map on the selected location
    setMapCenter({ lat: location.lat, lng: location.lng });

    setSelectedLocation({
      ...location,
      type: terrainType,
      solarScore,
      windScore,
      solarDescription,
      windDescription,
      windFactors,
      recommendation,
    });

    setSearchTerm(location.name);
    setShowSuggestions(false);
  };

  // "temperado" | "costeiro" | "montanhas" | "planícies" | "deserto" | "ártico" | "tropical" | "suburbano" | "floresta" | "urbano"
  // "temperate" | "coastal" | "mountains" | "plains" | "desert" | "arctic" | "tropical" | "suburban" | "forest" | "urban"
  const mapTerrainType = (type: keyof typeof BASE_WIND_POTENTIAL) => {
    switch (type) {
      case "temperate":
        return "temperado";
      case "coastal":
        return "costeiro";
      case "mountains":
        return "montanhas";
      case "plains":
        return "planícies";
      case "desert":
        return "deserto";
      case "arctic":
        return "ártico";
      case "tropical":
        return "tropical";
      case "suburban":
        return "suburbano";
      case "forest":
        return "floresta";
      case "urban":
        return "urbano";
      default:
        return "temperado";
    }
  };

  const terrainType = selectedLocation
    ? selectedLocation.type.charAt(0).toUpperCase() +
      selectedLocation.type.slice(1)
    : "";

  return (
    <Card className="border-green-200 mt-8">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <CardTitle className="text-green-700 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Análise de energia local
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="space-y-4">
            <div className="font-medium text-green-800">
              Selecione a localização
            </div>

            <LeafletMap
              onLocationSelect={handleLocationSelect}
              centerLocation={mapCenter}
            />

            {/* Search Section */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex gap-2">
                <Input
                  placeholder="Busque por uma localização..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="border-green-200"
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="border-green-200"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-green-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((location, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-green-50 cursor-pointer flex items-center"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <MapPin className="h-4 w-4 mr-2 text-green-600" />
                      {location.name}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Analysis Section */}
          <div className="space-y-4">
            {selectedLocation ? (
              <>
                <div className="font-medium text-green-800 flex items-center">
                  <Compass className="h-5 w-5 mr-2 text-green-700" />
                  Análise de Potencial Energético
                </div>

                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                  <h3 className="font-semibold text-lg text-green-800 mb-2">
                    {selectedLocation.name}
                  </h3>
                  <div className="text-sm text-gray-600 mb-4">
                    Latitude: {selectedLocation.lat.toFixed(2)}°, Longitude:{" "}
                    {selectedLocation.lng.toFixed(2)}°, Terreno:{" "}
                    {mapTerrainType(
                      terrainType as keyof typeof BASE_WIND_POTENTIAL
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Solar Score - Variable based on latitude */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-yellow-700">
                            Potencial Solar
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="ml-1">
                                  <Info className="h-3.5 w-3.5 text-yellow-500 opacity-70" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{selectedLocation.solarDescription}</p>
                                <p className="mt-1 text-xs">
                                  Ajustado para latitude:{" "}
                                  {Math.abs(selectedLocation.lat).toFixed(1)}°
                                  {selectedLocation.lat >= 0 ? "N" : "S"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm font-medium text-yellow-700">
                          {selectedLocation.solarScore?.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{ width: `${selectedLocation.solarScore}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 italic">
                        Varia de acordo com a latitude e o terreno
                      </div>
                    </div>

                    {/* Wind Score - Now variable based on location factors */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Wind className="h-4 w-4 text-sky-500 mr-1" />
                          <span className="text-sm font-medium text-sky-700">
                            Potencial eólico
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="ml-1">
                                  <Info className="h-3.5 w-3.5 text-sky-500 opacity-70" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{selectedLocation.windDescription}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-xs font-medium">
                                    Fatores de localização:
                                  </p>
                                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                    <div>Latitude influence:</div>
                                    <div>
                                      {selectedLocation.windFactors?.latitude.toFixed(
                                        0
                                      )}
                                      %
                                    </div>
                                    <div>Efeito de altitude:</div>
                                    <div>
                                      {selectedLocation.windFactors?.altitude.toFixed(
                                        0
                                      )}
                                      %
                                    </div>
                                    <div>Proximidade costeira:</div>
                                    <div>
                                      {selectedLocation.windFactors?.coastal.toFixed(
                                        0
                                      )}
                                      %
                                    </div>
                                    <div>Padrões sazonais:</div>
                                    <div>
                                      {selectedLocation.windFactors?.seasonal.toFixed(
                                        0
                                      )}
                                      %
                                    </div>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-sm font-medium text-sky-700">
                          {selectedLocation.windScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-sky-500 h-2.5 rounded-full"
                          style={{ width: `${selectedLocation.windScore}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 italic">
                        Varia de acordo com o terreno, altitude, proximidade
                        costeira e latitude
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="mt-6 p-4 rounded-md border border-green-200 bg-white">
                    <h4 className="font-medium text-green-800 mb-2">
                      Recomendação
                    </h4>

                    {selectedLocation.recommendation === "solar" && (
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-100 p-2 rounded-full mt-1">
                          <Sun className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-yellow-700">
                              Energia solar
                            </span>{" "}
                            é mais vantajoso para este local devido à alta
                            irradiação solar e latitude favorável.
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Considere painéis fotovoltaicos com capacidades de
                            rastreamento solar para geração de energia ideal.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedLocation.recommendation === "wind" && (
                      <div className="flex items-start gap-3">
                        <div className="bg-sky-100 p-2 rounded-full mt-1">
                          <Wind className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-sky-700">
                              Energia eólica
                            </span>{" "}
                            é mais vantajoso para este local devido aos padrões
                            de vento consistentes e terreno favorável.
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Considere turbinas eólicas projetadas para as
                            condições de vento específicas desta região.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedLocation.recommendation === "both" && (
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-full mt-1">
                          <Compass className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-green-700">
                              Sistema híbrido
                            </span>{" "}
                            combinar energia solar e eólica seria ótimo para
                            este local.
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Uma abordagem combinada proporcionaria uma geração
                            de energia mais consistente em diferentes condições
                            climáticas e estações do ano.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-green-50 rounded-md border border-green-100">
                <MapPin className="h-12 w-12 text-green-300 mb-4" />
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Nenhum local selecionado
                </h3>
                <p className="text-sm text-gray-600">
                  Selecione um local no mapa ou pesquise um local para ver qual
                  fonte de energia renovável seria mais vantajosa.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
