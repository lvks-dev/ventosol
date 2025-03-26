"use client";

import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wind, Sun, CloudSun, Compass, Cloud } from "lucide-react";
import type { WeatherConditions } from "@/components/dashboard";

interface ControlPanelProps {
  conditions: WeatherConditions;
  updateConditions: (newConditions: Partial<WeatherConditions>) => void;
}

export default function ControlPanel({
  conditions,
  updateConditions,
}: ControlPanelProps) {
  return (
    <Card className="bg-white border-green-200">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <CardTitle className="text-green-700">
          Controle das condições ambientais
        </CardTitle>
        <CardDescription>
          Ajuste as condições ambientais para simular o impacto na geração de
          energia
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wind className="h-5 w-5 text-sky-500 mr-2" />
                <span className="font-medium text-green-800">
                  Velocidade do vento
                </span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {conditions.windSpeed} km/h
              </span>
            </div>
            <Slider
              value={[conditions.windSpeed]}
              min={0}
              max={50}
              step={1}
              className="[&>span]:bg-sky-400"
              onValueChange={(value) =>
                updateConditions({ windSpeed: value[0] })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Compass className="h-5 w-5 text-sky-500 mr-2" />
                <span className="font-medium text-green-800">
                  Direção do vento
                </span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {conditions.windDirection}°
              </span>
            </div>
            <Slider
              value={[conditions.windDirection]}
              min={0}
              max={360}
              step={5}
              className="[&>span]:bg-sky-400"
              onValueChange={(value) =>
                updateConditions({ windDirection: value[0] })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sun className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium text-green-800">
                  Intensidade do sol
                </span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {conditions.sunIntensity}%
              </span>
            </div>
            <Slider
              value={[conditions.sunIntensity]}
              min={0}
              max={100}
              step={1}
              className="[&>span]:bg-yellow-400"
              onValueChange={(value) =>
                updateConditions({ sunIntensity: value[0] })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CloudSun className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-medium text-green-800">
                  Ângulo da luz solar
                </span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {conditions.sunAngle}°
              </span>
            </div>
            <Slider
              value={[conditions.sunAngle]}
              min={0}
              max={90}
              step={1}
              className="[&>span]:bg-yellow-400"
              onValueChange={(value) =>
                updateConditions({ sunAngle: value[0] })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Cloud className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium text-green-800">Nebulosidade</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {conditions.cloudCover}%
              </span>
            </div>
            <Slider
              value={[conditions.cloudCover]}
              min={0}
              max={100}
              step={1}
              className="[&>span]:bg-gray-300"
              onValueChange={(value) =>
                updateConditions({ cloudCover: value[0] })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
