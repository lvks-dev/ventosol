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

    // Wind stream properties
    const streamCount = 12;
    const streams: {
      points: { x: number; y: number }[];
      width: number;
      speed: number;
      opacity: number;
    }[] = [];

    for (let i = 0; i < streamCount; i++) {
      const startY = Math.random() * canvas.height * 0.7;
      const points = [];
      const segmentCount = 8 + Math.floor(Math.random() * 5);
      const streamWidth = 1 + Math.random() * 0.5;

      for (let j = 0; j < segmentCount; j++) {
        points.push({
          x: (canvas.width / segmentCount) * j,
          y: startY + (Math.random() * 30 - 15),
        });
      }

      streams.push({
        points,
        width: streamWidth,
        speed: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }

    // Leaf properties
    const leafCount = 15;
    const leaves: {
      x: number;
      y: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      speed: number;
      color: string;
      type: number;
    }[] = [];

    const leafColors = [
      "#8BC34A", // Leaf green
      "#9CCC65", // Light green
      "#AED581", // Lighter green
      "#C5E1A5", // Very light green
      "#DCEDC8", // Almost white green
      "#F1C40F", // Yellow
      "#FFD54F", // Light yellow
    ];

    for (let i = 0; i < leafCount; i++) {
      leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        size: 5 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.05 - 0.025,
        speed: 0.5 + Math.random() * 1.5,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        type: Math.floor(Math.random() * 3), // 3 different leaf shapes
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

      // Update and draw wind streams
      const windAngle = (conditions.windDirection * Math.PI) / 180;
      const windSpeedFactor = conditions.windSpeed / 15;

      streams.forEach((stream) => {
        // Update stream points
        for (let i = 0; i < stream.points.length; i++) {
          stream.points[i].x +=
            stream.speed *
            windSpeedFactor *
            Math.cos(windAngle) *
            (deltaTime / 16);

          // Add a slight vertical movement based on wind direction
          stream.points[i].y +=
            stream.speed *
            windSpeedFactor *
            Math.sin(windAngle) *
            0.3 *
            (deltaTime / 16);

          // Add some natural waviness
          stream.points[i].y +=
            Math.sin(time / 1000 + i) * 0.2 * (deltaTime / 16);

          // Reset if off screen
          if (stream.points[i].x > canvas.width) {
            stream.points[i].x = 0;
            stream.points[i].y = Math.random() * canvas.height * 0.7;
          }
          if (stream.points[i].x < 0) {
            stream.points[i].x = canvas.width;
            stream.points[i].y = Math.random() * canvas.height * 0.7;
          }
          if (stream.points[i].y > canvas.height * 0.8) {
            stream.points[i].y = canvas.height * 0.8;
          }
          if (stream.points[i].y < 0) {
            stream.points[i].y = 0;
          }
        }

        // Draw stream as a smooth curve
        ctx.beginPath();
        ctx.moveTo(stream.points[0].x, stream.points[0].y);

        for (let i = 1; i < stream.points.length - 2; i++) {
          const xc = (stream.points[i].x + stream.points[i + 1].x) / 2;
          const yc = (stream.points[i].y + stream.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(stream.points[i].x, stream.points[i].y, xc, yc);
        }

        // Handle the last two points
        if (stream.points.length > 2) {
          const lastIndex = stream.points.length - 1;
          ctx.quadraticCurveTo(
            stream.points[lastIndex - 1].x,
            stream.points[lastIndex - 1].y,
            stream.points[lastIndex].x,
            stream.points[lastIndex].y
          );
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${
          stream.opacity * (windSpeedFactor / 2 + 0.5)
        })`;
        ctx.lineWidth = stream.width * (windSpeedFactor / 2 + 0.5);
        ctx.stroke();
      });

      // Update and draw leaves
      leaves.forEach((leaf) => {
        // Update leaf position
        leaf.x +=
          leaf.speed * windSpeedFactor * Math.cos(windAngle) * (deltaTime / 16);
        leaf.y +=
          (leaf.speed * 0.5 * windSpeedFactor * Math.sin(windAngle) + 0.2) *
          (deltaTime / 16); // Slight downward drift

        // Add some natural waviness
        leaf.y += Math.sin(time / 1000 + leaf.x) * 0.3 * (deltaTime / 16);

        // Update rotation
        leaf.rotation +=
          leaf.rotationSpeed * windSpeedFactor * (deltaTime / 16);

        // Reset if off screen
        if (leaf.x > canvas.width + leaf.size) {
          leaf.x = -leaf.size;
          leaf.y = Math.random() * canvas.height * 0.7;
        }
        if (leaf.x < -leaf.size) {
          leaf.x = canvas.width + leaf.size;
          leaf.y = Math.random() * canvas.height * 0.7;
        }
        if (leaf.y > canvas.height * 0.8) {
          leaf.y = Math.random() * canvas.height * 0.5;
          leaf.x = Math.random() * canvas.width;
        }

        // Draw leaf
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.fillStyle = leaf.color;

        // Different leaf shapes
        if (leaf.type === 0) {
          // Oval leaf
          ctx.beginPath();
          ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Leaf vein
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size * 0.6);
          ctx.lineTo(0, leaf.size * 0.6);
          ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else if (leaf.type === 1) {
          // Heart-shaped leaf
          const s = leaf.size * 0.8;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(s * 0.8, -s * 0.7, s * 1.5, 0, 0, s);
          ctx.bezierCurveTo(-s * 1.5, 0, -s * 0.8, -s * 0.7, 0, s * 0.3);
          ctx.fill();
        } else {
          // Simple pointed leaf
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size * 0.8);
          ctx.quadraticCurveTo(leaf.size * 0.8, 0, 0, leaf.size * 0.8);
          ctx.quadraticCurveTo(-leaf.size * 0.8, 0, 0, -leaf.size * 0.8);
          ctx.fill();

          // Leaf vein
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size * 0.8);
          ctx.lineTo(0, leaf.size * 0.8);
          ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        ctx.restore();
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
