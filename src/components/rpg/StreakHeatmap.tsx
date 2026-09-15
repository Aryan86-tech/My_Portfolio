"use client";

import React from "react";
import { Flame, Calendar as CalendarIcon } from "lucide-react";

interface HeatmapDay {
  date: string; // YYYY-MM-DD
  score: number; // 0 - 100
}

interface StreakHeatmapProps {
  currentStreak: number;
  longestStreak: number;
  daysData?: HeatmapDay[];
}

export function StreakHeatmap({
  currentStreak = 14,
  longestStreak = 21,
  daysData = [],
}: StreakHeatmapProps) {
  // Generate last 30 days grid if not fully provided
  const days: HeatmapDay[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const existing = daysData.find((item) => item.date === dateStr);
    days.push(
      existing || {
        date: dateStr,
        // Mock sample scores for visual demonstration if no entry yet
        score: i === 0 ? 87 : Math.random() > 0.3 ? Math.floor(Math.random() * 40) + 60 : 0,
      }
    );
  }

  const getIntensityColor = (score: number) => {
    if (score === 0) return "bg-zinc-900 border-zinc-800 text-zinc-600";
    if (score < 40) return "bg-cyan-950/60 border-cyan-800 text-cyan-400";
    if (score < 75) return "bg-cyan-800/80 border-cyan-500 text-cyan-200";
    return "bg-cyan-500 border-cyan-300 text-zinc-950 font-bold shadow-sm shadow-cyan-400/50";
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-orange-950/60 border border-orange-500/30 text-orange-400 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black font-mono text-slate-100 uppercase tracking-wider">
              STREAK & CALENDAR HEATMAP
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              30-day historical discipline intensity grid.
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-xs font-mono">
          <div className="bg-zinc-950 border border-orange-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-orange-400/80">CURRENT:</span>
            <span className="text-orange-400 font-bold">🔥 {currentStreak} D</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-zinc-400">LONGEST:</span>
            <span className="text-slate-200 font-bold">{longestStreak} D</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {days.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center text-[10px] font-mono transition-all hover:scale-105 cursor-pointer ${getIntensityColor(
                day.score
              )}`}
              title={`${day.date}: ${day.score}% Discipline Score`}
            >
              <span>{day.date.split("-")[2]}</span>
              {day.score > 0 && <span className="text-[9px] opacity-80">{day.score}%</span>}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-3 pt-2">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3 h-3 text-zinc-500" />
            <span>30 DAYS AGO</span>
          </div>
          <div className="flex items-center gap-1">
            <span>LESS</span>
            <span className="w-2.5 h-2.5 rounded bg-zinc-900 border border-zinc-800 inline-block" />
            <span className="w-2.5 h-2.5 rounded bg-cyan-950 border border-cyan-800 inline-block" />
            <span className="w-2.5 h-2.5 rounded bg-cyan-800 inline-block" />
            <span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block" />
            <span>MORE</span>
          </div>
          <span>TODAY</span>
        </div>
      </div>
    </div>
  );
}
