"use client";

import React from "react";
import { Flame, Shield, Snowflake } from "lucide-react";
import { calculateLevelFromXp, getRankFromLevel } from "@/lib/services/rpgEngine";

interface PlayerHeaderProps {
  username: string;
  totalXp: number;
  currentStreak: number;
  activeWinterArc?: {
    startDate: string;
    endDate: string;
    totalDays: number;
  } | null;
}

export function PlayerHeader({
  username,
  totalXp = 0,
  currentStreak = 0,
  activeWinterArc,
}: PlayerHeaderProps) {
  const levelStats = calculateLevelFromXp(totalXp);
  const rankStats = getRankFromLevel(levelStats.level);

  // Calculate Winter Arc day status
  let winterArcDayText = "DAY 1";
  if (activeWinterArc?.startDate) {
    const start = new Date(activeWinterArc.startDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1);
    winterArcDayText = `DAY ${diffDays} / ${activeWinterArc.totalDays || 90}`;
  }

  return (
    <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-slate-950 border border-cyan-500/20 rounded-xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
      {/* Subtle frost accent background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        {/* Left Player Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-900 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xl md:text-2xl shadow-lg shadow-cyan-950/50">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-1 bg-zinc-950 border border-cyan-500/40 px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300">
              LVL {levelStats.level}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400/90 uppercase">
                WINTER ARC • {winterArcDayText}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight capitalize">
              {username}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded border"
                style={{
                  color: rankStats.color,
                  borderColor: `${rankStats.color}40`,
                  backgroundColor: `${rankStats.color}15`,
                }}
              >
                <span>{rankStats.badge}</span>
                <span>{rankStats.name}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right XP & Streak Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-3 md:pt-0 md:pl-6">
          {/* XP Progress */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-slate-400 font-medium">XP PROGRESS</span>
              <span className="text-cyan-400 font-bold">
                {levelStats.currentLevelXp.toLocaleString()} / {levelStats.nextLevelXp.toLocaleString()} XP
              </span>
            </div>
            <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-gradient-to-r from-cyan-600 via-teal-400 to-cyan-300 h-full rounded-full transition-all duration-500 shadow-sm shadow-cyan-400/50"
                style={{ width: `${levelStats.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-3 bg-zinc-900/90 border border-orange-500/30 px-3.5 py-2 rounded-xl text-right">
            <Flame className="w-6 h-6 text-orange-400 fill-orange-500/20 animate-bounce" />
            <div>
              <div className="text-[10px] font-mono text-orange-300/80 font-bold uppercase tracking-wider">
                CURRENT STREAK
              </div>
              <div className="text-base font-black text-orange-400 font-mono">
                🔥 {currentStreak} {currentStreak === 1 ? "DAY" : "DAYS"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
