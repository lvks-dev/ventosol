"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind } from "lucide-react";
import type { WeatherConditions } from "@/components/dashboard";

interface WindSectionProps {
  conditions: WeatherConditions;
  fullWidth?: boolean;
}

export default function WindSection({
  conditions,
  fullWidth = false,
}: WindSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Calculate energy output based on wind conditions
  const energyOutput = Math.round((conditions.windSpeed / 50) * 100);
  const efficiency = Math.round(
    90 - Math.abs((conditions.windDirection % 180) - 90) / 2
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Wind turbine properties
    const turbineCount = 3;
    const turbineBaseWidth = 10;
    const turbineHeight = canvas.height * 0.6;
    const turbineSpacing = canvas.width / (turbineCount + 1);

    // Wind particles
    const particles: { x: number; y: number; speed: number; size: number }[] =
      [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 3 + 1,
      });
    }

    // Animation variables
    const rotationAngles = Array(turbineCount).fill(0);
    let lastTime = 0;

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, "#87CEEB"); // Light blue
      skyGradient.addColorStop(1, "#E0F7FA");
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = "#8BC34A"; // Leaf green
      ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);

      // Update wind particles
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      particles.forEach((particle) => {
        particle.x +=
          ((particle.speed * conditions.windSpeed) / 15) *
          Math.cos((conditions.windDirection * Math.PI) / 180);
        particle.y +=
          ((particle.speed * conditions.windSpeed) / 15) *
          Math.sin((conditions.windDirection * Math.PI) / 180);

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw wind turbines
      for (let i = 0; i < turbineCount; i++) {
        const x = (i + 1) * turbineSpacing;
        const baseY = canvas.height * 0.8;

        // Draw turbine pole
        ctx.fillStyle = "#78909C";
        ctx.beginPath();
        ctx.moveTo(x - turbineBaseWidth / 2, baseY);
        ctx.lineTo(x + turbineBaseWidth / 2, baseY);
        ctx.lineTo(x + turbineBaseWidth / 4, baseY - turbineHeight);
        ctx.lineTo(x - turbineBaseWidth / 4, baseY - turbineHeight);
        ctx.closePath();
        ctx.fill();

        // Draw turbine hub
        const hubX = x;
        const hubY = baseY - turbineHeight;
        const hubRadius = 10;
        ctx.fillStyle = "#455A64";
        ctx.beginPath();
        ctx.arc(hubX, hubY, hubRadius, 0, Math.PI * 2);
        ctx.fill();

        // Update rotation based on wind speed and direction
        const optimalDirection = 90; // Assuming turbines face east by default
        const directionFactor =
          1 -
          Math.abs(
            ((conditions.windDirection - optimalDirection) % 360) - 180
          ) /
            180;
        const rotationSpeed = (conditions.windSpeed / 5) * directionFactor;
        rotationAngles[i] += (rotationSpeed * deltaTime) / 50;

        // Draw turbine blades
        const bladeLength = 60;
        ctx.fillStyle = "#ECEFF1";
        for (let j = 0; j < 3; j++) {
          const bladeAngle = rotationAngles[i] + (j * 2 * Math.PI) / 3;
          ctx.save();
          ctx.translate(hubX, hubY);
          ctx.rotate(bladeAngle);
          ctx.beginPath();
          ctx.ellipse(
            bladeLength / 2,
            0,
            bladeLength / 2,
            8,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [conditions.windSpeed, conditions.windDirection]);

  return (
    <Card
      className={`bg-white border-sky-200 ${fullWidth ? "col-span-full" : ""}`}
    >
      <CardHeader className="bg-sky-50 border-b border-sky-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wind className="h-5 w-5 text-sky-500 mr-2" />
            <CardTitle className="text-sky-700">
              Simulação de Energia Eólica
            </CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium text-sky-700">Saída:</span>{" "}
              <span className="text-sky-600">{energyOutput}%</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-sky-700">Eficiência:</span>{" "}
              <span className="text-sky-600">{efficiency}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[300px]">
        <canvas ref={canvasRef} className="w-full h-full" />
      </CardContent>
    </Card>
  );
}
