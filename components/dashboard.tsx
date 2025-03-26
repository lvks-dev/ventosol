"use client";

import { useState } from "react";
import WindSection from "@/components/wind-section";
import SolarSection from "@/components/solar-section";
import ControlPanel from "@/components/control-panel";
import InfoSection from "@/components/infor-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type WeatherConditions = {
  windSpeed: number;
  windDirection: number;
  sunIntensity: number;
  sunAngle: number;
  cloudCover: number;
};

export default function Dashboard() {
  const [conditions, setConditions] = useState<WeatherConditions>({
    windSpeed: 5,
    windDirection: 45,
    sunIntensity: 85,
    sunAngle: 60,
    cloudCover: 10,
  });

  const updateConditions = (newConditions: Partial<WeatherConditions>) => {
    setConditions((prev) => ({ ...prev, ...newConditions }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <InfoSection />

      <header className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-green-700 mb-2">
          Painel interativo de energia renovável
        </h2>
        <p className="text-lg text-green-600">
          Explore o impacto das condições ambientais na geração de energia
          eólica e solar
        </p>
      </header>

      <ControlPanel
        conditions={conditions}
        updateConditions={updateConditions}
      />

      <Tabs defaultValue="combined" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 bg-green-100">
          <TabsTrigger value="combined">Ambos</TabsTrigger>
          <TabsTrigger value="wind">Energia Eólica</TabsTrigger>
          <TabsTrigger value="solar">Energia Solar</TabsTrigger>
        </TabsList>
        <TabsContent
          value="combined"
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <WindSection conditions={conditions} />
          <SolarSection conditions={conditions} />
        </TabsContent>
        <TabsContent value="wind" className="mt-4">
          <WindSection conditions={conditions} fullWidth />
        </TabsContent>
        <TabsContent value="solar" className="mt-4">
          <SolarSection conditions={conditions} fullWidth />
        </TabsContent>
      </Tabs>
    </div>
  );
}
