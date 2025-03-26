"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun } from "lucide-react";
import type { WeatherConditions } from "@/components/dashboard";

interface SolarSectionProps {
  conditions: WeatherConditions;
  fullWidth?: boolean;
}

export default function SolarSection({
  conditions,
  fullWidth = false,
}: SolarSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Calculate energy output based on solar conditions
  const energyOutput = Math.round(
    (((conditions.sunIntensity * (90 - Math.abs(conditions.sunAngle - 45))) /
      90) *
      (100 - conditions.cloudCover)) /
      100
  );
  const efficiency = Math.round(
    100 - conditions.cloudCover / 2 - Math.abs(conditions.sunAngle - 45) / 2
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

    // Solar panel properties
    const panelCount = 5;
    const panelWidth = canvas.width * 0.15;
    const panelHeight = panelWidth * 0.6;
    const panelSpacing = canvas.width / (panelCount + 1);

    // Sun and ray properties
    const sunRadius = 30;
    const rayCount = 20;
    const maxRayLength = 50;

    // Cloud properties
    const clouds: {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
    }[] = [];
    const cloudCount = Math.floor(conditions.cloudCover / 20) + 1;

    for (let i = 0; i < cloudCount; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.5),
        width: Math.random() * 100 + 50,
        height: Math.random() * 40 + 20,
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
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

      // Calculate sun position based on angle
      const sunX =
        canvas.width * 0.2 + (canvas.width * 0.6 * conditions.sunAngle) / 90;
      const sunY =
        canvas.height * 0.6 - (canvas.height * 0.5 * conditions.sunAngle) / 90;

      // Draw sun
      const sunGradient = ctx.createRadialGradient(
        sunX,
        sunY,
        0,
        sunX,
        sunY,
        sunRadius
      );
      sunGradient.addColorStop(0, "rgba(255, 255, 190, 1)");
      sunGradient.addColorStop(1, "rgba(255, 204, 0, 1)");

      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw sun rays
      const rayIntensity = conditions.sunIntensity / 100;
      ctx.strokeStyle = "rgba(255, 255, 0, 0.6)";
      ctx.lineWidth = 2;

      for (let i = 0; i < rayCount; i++) {
        const angle = (i * 2 * Math.PI) / rayCount;
        const rayLength = maxRayLength * rayIntensity;

        ctx.beginPath();
        ctx.moveTo(
          sunX + Math.cos(angle) * sunRadius,
          sunY + Math.sin(angle) * sunRadius
        );
        ctx.lineTo(
          sunX + Math.cos(angle) * (sunRadius + rayLength),
          sunY + Math.sin(angle) * (sunRadius + rayLength)
        );
        ctx.stroke();
      }

      // Draw clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      clouds.forEach((cloud) => {
        // Update cloud position
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + cloud.width) {
          cloud.x = -cloud.width;
        }

        // Draw cloud
        ctx.beginPath();
        ctx.ellipse(
          cloud.x,
          cloud.y,
          cloud.width / 2,
          cloud.height / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // Draw solar panels
      for (let i = 0; i < panelCount; i++) {
        const x = (i + 1) * panelSpacing - panelWidth / 2;
        const baseY = canvas.height * 0.8;

        // Draw panel stand
        ctx.fillStyle = "#78909C";
        ctx.beginPath();
        ctx.rect(x + panelWidth / 2 - 5, baseY - 30, 10, 30);
        ctx.fill();

        // Calculate panel angle based on sun angle
        const panelAngle =
          Math.min(Math.max(conditions.sunAngle * 0.8, 10), 80) *
          (Math.PI / 180);

        // Draw panel
        ctx.save();
        ctx.translate(x + panelWidth / 2, baseY - 30);
        ctx.rotate(-panelAngle);

        // Panel frame
        ctx.fillStyle = "#455A64";
        ctx.fillRect(
          -panelWidth / 2 - 2,
          -panelHeight - 2,
          panelWidth + 4,
          panelHeight + 4
        );

        // Panel cells
        ctx.fillStyle = "#1A237E";
        ctx.fillRect(-panelWidth / 2, -panelHeight, panelWidth, panelHeight);

        // Draw grid lines on panel
        ctx.strokeStyle = "#3F51B5";
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let j = 1; j < 4; j++) {
          ctx.beginPath();
          ctx.moveTo(-panelWidth / 2, -panelHeight + (j * panelHeight) / 4);
          ctx.lineTo(panelWidth / 2, -panelHeight + (j * panelHeight) / 4);
          ctx.stroke();
        }

        // Vertical grid lines
        for (let j = 1; j < 6; j++) {
          ctx.beginPath();
          ctx.moveTo(-panelWidth / 2 + (j * panelWidth) / 6, -panelHeight);
          ctx.lineTo(-panelWidth / 2 + (j * panelWidth) / 6, 0);
          ctx.stroke();
        }

        ctx.restore();

        // Draw sun rays hitting panels if sun is visible
        if (conditions.sunIntensity > 20 && conditions.cloudCover < 80) {
          const rayOpacity =
            (conditions.sunIntensity / 100) * (1 - conditions.cloudCover / 100);

          ctx.strokeStyle = `rgba(255, 255, 0, ${rayOpacity * 0.7})`;
          ctx.lineWidth = 1;

          // Calculate ray angle from sun to panel
          const panelCenterX = x + panelWidth / 2;
          const panelCenterY =
            baseY - 30 - (panelHeight / 2) * Math.cos(panelAngle);

          const rayAngle = Math.atan2(panelCenterY - sunY, panelCenterX - sunX);

          // Draw multiple rays
          for (let j = 0; j < 5; j++) {
            const offsetX = (j - 2) * (panelWidth / 4);
            const rayStartX = panelCenterX + offsetX;
            const rayStartY = panelCenterY - offsetX * Math.sin(panelAngle);

            ctx.beginPath();
            ctx.moveTo(sunX, sunY);
            ctx.lineTo(rayStartX, rayStartY);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [conditions.sunIntensity, conditions.sunAngle, conditions.cloudCover]);

  return (
    <Card
      className={`bg-white border-yellow-200 ${
        fullWidth ? "col-span-full" : ""
      }`}
    >
      <CardHeader className="bg-yellow-50 border-b border-yellow-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sun className="h-5 w-5 text-yellow-500 mr-2" />
            <CardTitle className="text-yellow-700">
              Simulação de Energia Solar
            </CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium text-yellow-700">Saída:</span>{" "}
              <span className="text-yellow-600">{energyOutput}%</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-yellow-700">Eficiência:</span>{" "}
              <span className="text-yellow-600">{efficiency}%</span>
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
