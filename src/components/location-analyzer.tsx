"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Search,
  Wind,
  Sun,
  Compass,
  Info,
  CloudSun,
  Thermometer,
  Droplets,
} from "lucide-react";
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
      <div className="animate-pulse text-gray-500">Loading map...</div>
    </div>
  ),
});

// Sample locations for search suggestions
const SAMPLE_LOCATIONS = [
  { name: "Rome, Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
  { name: "New York, USA", lat: 40.7128, lng: -74.006 },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Rio de Janeiro, Brazil", lat: -22.9068, lng: -43.1729 },
  { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241 },
  { name: "Moscow, Russia", lat: 55.7558, lng: 37.6173 },
  { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708 },
];

// Weather data interface based on OpenWeatherMap API
interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Solar irradiance data interface based on OpenWeatherMap Energy API
interface SolarIrradianceData {
  lat: number;
  lon: number;
  date: string;
  interval: string;
  tz: string;
  sunrise: string;
  sunset: string;
  irradiance: {
    daily: {
      clear_sky: {
        ghi: number; // Global Horizontal Irradiance
        dni: number; // Direct Normal Irradiance
        dhi: number; // Diffuse Horizontal Irradiance
      };
      cloudy_sky: {
        ghi: number;
        dni: number;
        dhi: number;
      };
    }[];
  };
}

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  weatherData?: WeatherData;
  irradianceData?: SolarIrradianceData;
  solarScore?: number;
  windScore?: number;
  solarDescription?: string;
  windDescription?: string;
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
  const [isLoading, setIsLoading] = useState(false);

  // Filter suggestions based on search term
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 2) {
      const filtered = SAMPLE_LOCATIONS.filter((location) =>
        location.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
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
      setIsLoading(true);
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
        const lat = Number.parseFloat(result.lat);
        const lng = Number.parseFloat(result.lon);

        // Center the map on the searched location
        setMapCenter({ lat, lng });

        // Fetch weather data for this location
        await fetchWeatherAndIrradianceData({
          lat,
          lng,
          name: result.display_name,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error searching for location:", error);
      setIsLoading(false);
    }
  };

  // Fetch weather and solar irradiance data
  const fetchWeatherAndIrradianceData = async (location: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    try {
      setIsLoading(true);

      // In a real implementation, these would be real API calls
      // const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

      // Weather data
      // const weatherResponse = await fetch(
      //   `https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=metric`
      // )
      // const weatherData = await weatherResponse.json()

      // Solar irradiance data
      // const today = new Date().toISOString().split('T')[0]
      // const irradianceResponse = await fetch(
      //   `https://api.openweathermap.org/energy/1.0/solar/interval_data?lat=${location.lat}&lon=${location.lng}&date=${today}&interval=1h&appid=${apiKey}`
      // )
      // const irradianceData = await irradianceResponse.json()

      // Since we can't make real API calls, we'll simulate responses
      // using the sample data provided by the user

      // Simulated weather data
      const simulatedWeatherData: WeatherData = {
        coord: {
          lon: location.lng,
          lat: location.lat,
        },
        weather: [
          {
            id: 803,
            main: "Clouds",
            description: "broken clouds",
            icon: "04n",
          },
        ],
        main: {
          temp: 280.7,
          feels_like: 278.56,
          temp_min: 279.96,
          temp_max: 280.73,
          pressure: 1012,
          humidity: 75,
          sea_level: 1012,
          grnd_level: 945,
        },
        visibility: 10000,
        wind: {
          speed: 3.25,
          deg: 206,
          gust: 3.8,
        },
        clouds: {
          all: 52,
        },
        dt: 1746570093,
        sys: {
          type: 2,
          id: 2004688,
          country: "IT",
          sunrise: 1746590315,
          sunset: 1746642394,
        },
        timezone: 7200,
        id: 3163858,
        name: location.name.split(",")[0], // Just use the first part of the name
        cod: 200,
      };

      // Simulated solar irradiance data
      const simulatedIrradianceData: SolarIrradianceData = {
        lat: location.lat,
        lon: location.lng,
        date: "2023-10-10",
        interval: "1h",
        tz: "+01:00",
        sunrise: "2023-10-10T07:15:03",
        sunset: "2023-10-10T18:19:05",
        irradiance: {
          daily: [
            {
              clear_sky: {
                ghi: 3341.99,
                dni: 6736.42,
                dhi: 796.63,
              },
              cloudy_sky: {
                ghi: 1321.03,
                dni: 189.2,
                dhi: 1224.62,
              },
            },
          ],
        },
      };

      // Calculate energy potential based on weather and irradiance data
      calculateEnergyPotential(
        location,
        simulatedWeatherData,
        simulatedIrradianceData
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  // Handle location selection from map
  const handleLocationSelect = async (location: {
    lat: number;
    lng: number;
    name: string;
  }) => {
    // Center the map on the selected location
    setMapCenter({ lat: location.lat, lng: location.lng });

    // Fetch weather data for this location
    await fetchWeatherAndIrradianceData(location);

    setSearchTerm(location.name);
    setShowSuggestions(false);
  };

  // Calculate energy potential based on weather and irradiance data
  const calculateEnergyPotential = (
    location: { lat: number; lng: number; name: string },
    weatherData: WeatherData,
    irradianceData: SolarIrradianceData
  ) => {
    // Calculate solar potential based on irradiance data
    // This is much more accurate than our previous calculation

    // Get the irradiance values
    const clearSkyGHI = irradianceData.irradiance.daily[0].clear_sky.ghi;
    const cloudySkyGHI = irradianceData.irradiance.daily[0].cloudy_sky.ghi;

    // Calculate the actual GHI based on current cloud cover
    // Linear interpolation between clear sky and cloudy sky based on cloud cover percentage
    const cloudCoverFraction = weatherData.clouds.all / 100;
    const actualGHI =
      clearSkyGHI * (1 - cloudCoverFraction) +
      cloudySkyGHI * cloudCoverFraction;

    // Calculate solar score as a percentage of maximum possible GHI
    // Typical maximum GHI values range from 5000-7000 Wh/m² in very sunny locations
    const maxPossibleGHI = 7000;
    let solarScore = Math.round((actualGHI / maxPossibleGHI) * 100);

    // Cap at 100%
    solarScore = Math.min(100, solarScore);

    // Create solar description based on irradiance and weather
    let solarDescription = "";

    if (actualGHI > 3000) {
      solarDescription =
        "Excellent solar potential with high irradiance levels";
    } else if (actualGHI > 2000) {
      solarDescription =
        "Very good solar potential with good irradiance levels";
    } else if (actualGHI > 1000) {
      solarDescription = "Moderate solar potential";
    } else {
      solarDescription = "Limited solar potential due to low irradiance levels";
    }

    if (weatherData.clouds.all > 70) {
      solarDescription +=
        ". Heavy cloud cover is currently reducing efficiency";
    } else if (weatherData.clouds.all > 30) {
      solarDescription +=
        ". Partial cloud cover is slightly reducing efficiency";
    } else {
      solarDescription += ". Clear skies are optimal for solar generation";
    }

    // Calculate wind potential based on weather data
    // Factors: wind speed, wind consistency

    // 1. Wind speed factor (0-100%)
    // Wind speeds: 0-3 m/s (low), 3-7 m/s (moderate), 7-12 m/s (good), >12 m/s (excellent)
    let windSpeedFactor = 0;
    if (weatherData.wind.speed < 3) {
      windSpeedFactor = weatherData.wind.speed * 20;
    } else if (weatherData.wind.speed < 7) {
      windSpeedFactor = 60 + (weatherData.wind.speed - 3) * 10;
    } else if (weatherData.wind.speed < 12) {
      windSpeedFactor = 80 + (weatherData.wind.speed - 7) * 4;
    } else {
      windSpeedFactor = 100;
    }

    // 2. Wind gust factor - more consistent wind is better
    const gustFactor = weatherData.wind.gust
      ? 100 -
        Math.min(
          100,
          ((weatherData.wind.gust - weatherData.wind.speed) /
            weatherData.wind.speed) *
            100
        )
      : 80; // Default if gust data not available

    // 3. Altitude factor (simplified - using pressure as proxy)
    // Lower pressure generally means higher altitude
    const pressureFactor = Math.max(
      0,
      100 - (weatherData.main.pressure - 900) / 2
    );

    // Combine factors with weights
    const windScore = Math.round(
      windSpeedFactor * 0.7 + gustFactor * 0.2 + pressureFactor * 0.1
    );

    // Create wind description based on factors
    let windDescription = "";
    if (weatherData.wind.speed < 3) {
      windDescription = "Low wind speeds, minimal energy generation potential";
    } else if (weatherData.wind.speed < 7) {
      windDescription =
        "Moderate wind speeds, suitable for small to medium turbines";
    } else if (weatherData.wind.speed < 12) {
      windDescription = "Good wind speeds, excellent for energy generation";
    } else {
      windDescription =
        "Very high wind speeds, optimal for wind energy (may require turbine cutout protection)";
    }

    if (
      weatherData.wind.gust &&
      weatherData.wind.gust > weatherData.wind.speed * 1.5
    ) {
      windDescription += ". Gusty conditions may affect turbine efficiency";
    }

    // Determine recommendation
    let recommendation: "solar" | "wind" | "both" = "both";
    if (solarScore > windScore + 15) {
      recommendation = "solar";
    } else if (windScore > solarScore + 15) {
      recommendation = "wind";
    }

    // Update selected location with weather data and energy potential
    setSelectedLocation({
      ...location,
      weatherData,
      irradianceData,
      solarScore,
      windScore,
      solarDescription,
      windDescription,
      recommendation,
    });
  };

  // Convert wind direction degrees to cardinal direction
  const getWindDirection = (degrees: number): string => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  // Convert Kelvin to Celsius
  const kelvinToCelsius = (kelvin: number): number => {
    return kelvin - 273.15;
  };

  return (
    <Card className="border-green-200 mt-8">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <CardTitle className="text-green-700 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location Energy Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="space-y-4">
            <div className="font-medium text-green-800">Select Location</div>

            <LeafletMap
              onLocationSelect={handleLocationSelect}
              centerLocation={mapCenter}
            />

            {/* Search Section */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex gap-2">
                <Input
                  placeholder="Search location..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="border-green-200"
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="border-green-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
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
            {selectedLocation &&
            selectedLocation.weatherData &&
            selectedLocation.irradianceData ? (
              <>
                <div className="font-medium text-green-800 flex items-center">
                  <Compass className="h-5 w-5 mr-2 text-green-700" />
                  Energy Potential Analysis
                </div>

                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                  <h3 className="font-semibold text-lg text-green-800 mb-2">
                    {selectedLocation.weatherData.name},{" "}
                    {selectedLocation.weatherData.sys.country}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-md border border-green-100 flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="text-xs text-gray-500">Temperature</div>
                        <div className="font-medium">
                          {kelvinToCelsius(
                            selectedLocation.weatherData.main.temp
                          ).toFixed(1)}
                          °C
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-md border border-green-100 flex items-center gap-2">
                      <CloudSun className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-xs text-gray-500">Weather</div>
                        <div className="font-medium">
                          {selectedLocation.weatherData.weather[0].main}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-md border border-green-100 flex items-center gap-2">
                      <Wind className="h-5 w-5 text-sky-500" />
                      <div>
                        <div className="text-xs text-gray-500">Wind</div>
                        <div className="font-medium">
                          {selectedLocation.weatherData.wind.speed.toFixed(1)}{" "}
                          m/s{" "}
                          {getWindDirection(
                            selectedLocation.weatherData.wind.deg
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-md border border-green-100 flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-xs text-gray-500">Humidity</div>
                        <div className="font-medium">
                          {selectedLocation.weatherData.main.humidity}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Solar Score - Based on irradiance data */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-yellow-700">
                            Solar Potential
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
                                <div className="mt-2 space-y-1 text-xs">
                                  <p className="font-medium">
                                    Solar Irradiance Data:
                                  </p>
                                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                    <div>Clear sky GHI:</div>
                                    <div>
                                      {selectedLocation.irradianceData.irradiance.daily[0].clear_sky.ghi.toFixed(
                                        0
                                      )}{" "}
                                      Wh/m²
                                    </div>
                                    <div>Cloudy sky GHI:</div>
                                    <div>
                                      {selectedLocation.irradianceData.irradiance.daily[0].cloudy_sky.ghi.toFixed(
                                        0
                                      )}{" "}
                                      Wh/m²
                                    </div>
                                    <div>Current cloud cover:</div>
                                    <div>
                                      {selectedLocation.weatherData.clouds.all}%
                                    </div>
                                  </div>
                                </div>
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
                        Based on solar irradiance data and current cloud cover
                      </div>
                    </div>

                    {/* Wind Score - Based on weather data */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Wind className="h-4 w-4 text-sky-500 mr-1" />
                          <span className="text-sm font-medium text-sky-700">
                            Wind Potential
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
                                    Current conditions:
                                  </p>
                                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                    <div>Wind speed:</div>
                                    <div>
                                      {selectedLocation.weatherData.wind.speed.toFixed(
                                        1
                                      )}{" "}
                                      m/s
                                    </div>
                                    <div>Wind direction:</div>
                                    <div>
                                      {getWindDirection(
                                        selectedLocation.weatherData.wind.deg
                                      )}{" "}
                                      ({selectedLocation.weatherData.wind.deg}°)
                                    </div>
                                    {selectedLocation.weatherData.wind.gust && (
                                      <>
                                        <div>Wind gusts:</div>
                                        <div>
                                          {selectedLocation.weatherData.wind.gust.toFixed(
                                            1
                                          )}{" "}
                                          m/s
                                        </div>
                                      </>
                                    )}
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
                        Based on current wind speed, direction, and consistency
                      </div>
                    </div>
                  </div>

                  {/* Solar Irradiance Details */}
                  <div className="mt-4 p-4 bg-white rounded-md border border-yellow-200">
                    <h4 className="font-medium text-yellow-700 mb-2 flex items-center">
                      <Sun className="h-4 w-4 mr-1" /> Solar Irradiance Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs">
                          Global Horizontal Irradiance (GHI)
                        </div>
                        <div className="font-medium">
                          Clear:{" "}
                          {selectedLocation.irradianceData.irradiance.daily[0].clear_sky.ghi.toFixed(
                            0
                          )}{" "}
                          Wh/m²
                        </div>
                        <div className="font-medium">
                          Cloudy:{" "}
                          {selectedLocation.irradianceData.irradiance.daily[0].cloudy_sky.ghi.toFixed(
                            0
                          )}{" "}
                          Wh/m²
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">
                          Direct Normal Irradiance (DNI)
                        </div>
                        <div className="font-medium">
                          Clear:{" "}
                          {selectedLocation.irradianceData.irradiance.daily[0].clear_sky.dni.toFixed(
                            0
                          )}{" "}
                          Wh/m²
                        </div>
                        <div className="font-medium">
                          Cloudy:{" "}
                          {selectedLocation.irradianceData.irradiance.daily[0].cloudy_sky.dni.toFixed(
                            0
                          )}{" "}
                          Wh/m²
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <p>
                        <span className="font-medium">Sunrise:</span>{" "}
                        {new Date(
                          selectedLocation.irradianceData.sunrise
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" | "}
                        <span className="font-medium">Sunset:</span>{" "}
                        {new Date(
                          selectedLocation.irradianceData.sunset
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="mt-6 p-4 rounded-md border border-green-200 bg-white">
                    <h4 className="font-medium text-green-800 mb-2">
                      Recommendation
                    </h4>

                    {selectedLocation.recommendation === "solar" && (
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-100 p-2 rounded-full mt-1">
                          <Sun className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-yellow-700">
                              Solar energy
                            </span>{" "}
                            is more advantageous for this location under current
                            weather conditions.
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            With solar irradiance of{" "}
                            {selectedLocation.irradianceData.irradiance.daily[0].clear_sky.ghi.toFixed(
                              0
                            )}{" "}
                            Wh/m² under clear skies, this location has excellent
                            solar potential.
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
                              Wind energy
                            </span>{" "}
                            is more advantageous for this location under current
                            weather conditions.
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            With wind speeds of{" "}
                            {selectedLocation.weatherData.wind.speed.toFixed(1)}{" "}
                            m/s, this location has good wind energy potential.
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
                              Hybrid system
                            </span>{" "}
                            combining both solar and wind energy would be
                            optimal for this location.
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            With balanced solar irradiance and wind conditions,
                            a combined approach would provide more consistent
                            energy generation.
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
                  No Location Selected
                </h3>
                <p className="text-sm text-gray-600">
                  Select a location on the map or search for a location to see
                  which renewable energy source would be most advantageous based
                  on current weather conditions and solar irradiance data.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
