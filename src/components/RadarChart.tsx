"use client";

import React from "react";
import { radarStats } from "@/data/portfolioData";

interface RadarChartProps {
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ size = 320 }) => {
  const center = size / 2;
  const radius = size * 0.38;
  const totalStats = radarStats.length;

  // Calculate coordinates for polygon vertices given angle and radius percentage
  const getCoordinates = (index: number, valuePercent: number) => {
    const angle = (Math.PI * 2 * index) / totalStats - Math.PI / 2;
    const r = (radius * valuePercent) / 100;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build grid rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Path string for current stat values
  const dataPoints = radarStats.map((stat, i) => getCoordinates(i, stat.value));
  const dataPathString =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-p5-card/80 border border-p5-red/30 p5-clip-card shadow-p5-glow">
      <div className="absolute top-3 left-4 text-xs font-heading tracking-widest text-p5-red uppercase">
        ★ PARAMETER STAR CHART ★
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Concentric Rings */}
        {rings.map((ring, ringIdx) => {
          const ringPoints = radarStats.map((_, i) => getCoordinates(i, ring * 100));
          const ringPath =
            ringPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

          return (
            <path
              key={`ring-${ringIdx}`}
              d={ringPath}
              fill="none"
              stroke={ringIdx === rings.length - 1 ? "#FF0000" : "#333333"}
              strokeWidth={ringIdx === rings.length - 1 ? "2" : "1"}
              strokeDasharray={ringIdx < rings.length - 1 ? "3 3" : undefined}
              opacity={ringIdx === rings.length - 1 ? 0.8 : 0.5}
            />
          );
        })}

        {/* Axes Lines */}
        {radarStats.map((_, i) => {
          const outer = getCoordinates(i, 100);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#333333"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Stat Polygon Area Fill */}
        <path
          d={dataPathString}
          fill="rgba(255, 0, 0, 0.35)"
          stroke="#FF0000"
          strokeWidth="3"
          className="transition-all duration-500 hover:fill-p5-red/50"
        />

        {/* Stat Value Nodes & Labels */}
        {radarStats.map((stat, i) => {
          const point = getCoordinates(i, stat.value);
          const labelPoint = getCoordinates(i, 118);

          return (
            <g key={`node-${i}`}>
              {/* Vertex Node */}
              <circle cx={point.x} cy={point.y} r="5" fill="#FFD700" stroke="#FF0000" strokeWidth="2" />

              {/* Text Label */}
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#FFFFFF"
                className="font-heading text-xs tracking-wider font-bold uppercase select-none"
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.9)" }}
              >
                {stat.stat} ({stat.value})
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend Table */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-4 text-xs font-heading tracking-wider border-t border-p5-gray-dark/50 pt-3 w-full">
        {radarStats.map((stat, i) => (
          <div key={i} className="flex items-center justify-between text-p5-gray">
            <span className="text-white">{stat.stat}:</span>
            <span className="text-p5-red font-bold">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
