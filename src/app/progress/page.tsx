"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PlayerHeader } from "@/components/layout/PlayerHeader";
import {
  TrendingUp,
  Zap,
  Flame,
  Dumbbell,
  Trophy,
  CheckSquare,
  Apple,
  Scale,
  Calendar as CalendarIcon,
  Sparkles,
  Download,
  ArrowRight,
  Info,
} from "lucide-react";

export default function ProgressionPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [rangeFilter, setRangeFilter] = useState<"7D" | "30D" | "90D" | "ALL">("30D");

  useEffect(() => {
    fetchProgressionData(rangeFilter);
  }, [rangeFilter]);

  const fetchProgressionData = async (selectedRange: string) => {
    try {
      const [uRes, aRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/progress/analytics?range=${selectedRange}`),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUserData(u);
      }

      if (aRes.ok) {
        const a = await aRes.json();
        setAnalyticsData(a);
      }
    } catch (err) {
      console.error("Progression data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    window.open("/api/export", "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-cyan-400 flex flex-col items-center justify-center font-mono">
        <Sparkles className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest">LOADING CHARACTER PROGRESSION...</span>
      </div>
    );
  }

  const profile = userData?.profile || {};
  const username = userData?.user?.username || "Warrior";
  const activeArc = userData?.activeWinterArc;

  const arc = analyticsData?.winterArc || {};
  const cards = analyticsData?.cards || {};
  const scores = analyticsData?.scores || {};
  const category = scores?.categoryBreakdown || {};
  const recentPrs: any[] = analyticsData?.recentPrs || [];
  const insights: string[] = analyticsData?.insights || [];
  const dailyScores: any[] = scores?.dailyScores || [];

  return (
    <AppShell>
      <div className="space-y-6 font-mono">
        {/* PLAYER HEADER */}
        <PlayerHeader
          username={username}
          totalXp={profile.totalXp || 0}
          currentStreak={profile.currentStreak || 0}
          activeWinterArc={activeArc}
        />

        {/* HEADER & QUICK ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <span>CHARACTER PROGRESSION & ANALYTICS</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Connect discipline, fitness, nutrition, and body metrics into long-term growth.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/progress/weekly")}
              className="bg-zinc-800 hover:bg-zinc-700 text-cyan-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all border border-zinc-700"
            >
              <span>Weekly Review</span>
            </button>
            <button
              onClick={() => router.push("/calendar")}
              className="bg-zinc-800 hover:bg-zinc-700 text-teal-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all border border-zinc-700"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => router.push("/achievements")}
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all border border-zinc-700"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Achievements</span>
            </button>
            <button
              onClick={handleExportData}
              className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 1. WINTER ARC TIMELINE PROGRESS CARD */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                WINTER ARC TIMELINE
              </span>
              <h2 className="text-2xl font-black text-slate-100 mt-0.5">
                DAY {arc.currentArcDay} / {arc.totalArcDays}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 font-bold block">{arc.daysRemaining} DAYS REMAINING</span>
              <span className="text-sm font-black text-cyan-400">{arc.completionPercent}% COMPLETE</span>
            </div>
          </div>

          <div className="w-full bg-zinc-950 h-3.5 rounded-full border border-zinc-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${arc.completionPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-zinc-800/80">
            <div>
              <span className="text-zinc-500 block text-[10px]">CURRENT LEVEL</span>
              <span className="font-bold text-slate-200">Level {arc.level}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">CURRENT RANK</span>
              <span className="font-bold text-cyan-400">{arc.rank}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">TOTAL XP</span>
              <span className="font-bold text-emerald-400">{arc.totalXp} XP</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">ACTIVE STREAK</span>
              <span className="font-bold text-amber-400">{arc.currentStreak} Days</span>
            </div>
          </div>
        </div>

        {/* 2. KEY PROGRESS CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "TOTAL XP", val: cards.totalXp, icon: Zap, color: "text-amber-400" },
            { label: "STREAK", val: `${cards.currentStreak}d`, icon: Flame, color: "text-orange-400" },
            { label: "WORKOUTS", val: cards.workoutsCount, icon: Dumbbell, color: "text-cyan-400" },
            { label: "PRs", val: cards.prsCount, icon: Trophy, color: "text-yellow-400" },
            { label: "QUESTS", val: `${cards.questCompletionPercent}%`, icon: CheckSquare, color: "text-purple-400" },
            { label: "NUTRITION", val: `${cards.nutritionConsistencyPercent}%`, icon: Apple, color: "text-emerald-400" },
            { label: "WEIGHT", val: `${cards.weightChange > 0 ? `+${cards.weightChange}` : cards.weightChange} ${cards.unit}`, icon: Scale, color: "text-teal-400" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{c.label}</span>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <div className="text-xl font-black text-slate-100">{c.val}</div>
              </div>
            );
          })}
        </div>

        {/* 3. DAILY SCORE ANALYTICS & CATEGORY BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Score Chart */}
          <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-100 tracking-tight">
                  DAILY DISCIPLINE SCORE TREND
                </h3>
                <p className="text-xs text-zinc-400">Weighted scores (Fitness 30%, Nutrition 25%, Discipline 25%, Recovery 20%).</p>
              </div>

              <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {(["7D", "30D", "90D", "ALL"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRangeFilter(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      rangeFilter === r
                        ? "bg-cyan-500 text-zinc-950"
                        : "text-zinc-400 hover:text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {dailyScores.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs uppercase tracking-widest border border-dashed border-zinc-800 rounded-xl">
                Not enough data yet. Complete daily activities to see your score trend.
              </div>
            ) : (
              <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 px-2 border-b border-zinc-800 pb-2">
                {dailyScores.slice(-14).map((s, idx) => (
                  <div key={s.id || idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round(s.score)}%
                    </span>
                    <div
                      className="w-full max-w-[24px] bg-gradient-to-t from-cyan-600 to-teal-400 rounded-t-lg transition-all"
                      style={{ height: `${Math.max(15, Math.round(s.score))}%` }}
                    />
                    <span className="text-[9px] text-zinc-500 uppercase tracking-tighter truncate w-full text-center">
                      {s.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
              <div>
                <span className="text-zinc-500 block text-[10px]">AVERAGE SCORE</span>
                <span className="font-bold text-cyan-400">{scores.avgScore}%</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">BEST SCORE</span>
                <span className="font-bold text-emerald-400">{scores.bestScore}%</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">LOWEST SCORE</span>
                <span className="font-bold text-zinc-400">{scores.lowestScore}%</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-100 tracking-tight border-b border-zinc-800/80 pb-3">
              SCORE CATEGORY BREAKDOWN
            </h3>

            <div className="space-y-4">
              {[
                { label: "FITNESS (30%)", val: category.fitness || 90, color: "bg-cyan-500" },
                { label: "NUTRITION (25%)", val: category.nutrition || 84, color: "bg-emerald-500" },
                { label: "DISCIPLINE (25%)", val: category.discipline || 88, color: "bg-purple-500" },
                { label: "RECOVERY (20%)", val: category.recovery || 80, color: "bg-amber-500" },
              ].map((cat) => (
                <div key={cat.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">{cat.label}</span>
                    <span className="font-bold text-slate-100">{cat.val}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-2.5 rounded-full border border-zinc-800 overflow-hidden">
                    <div
                      className={`${cat.color} h-full rounded-full transition-all`}
                      style={{ width: `${cat.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. RECENT PERSONAL BESTS & DATA-DRIVEN INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Bests Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>RECENT PERSONAL BESTS</span>
            </h3>

            {recentPrs.length === 0 ? (
              <p className="text-xs text-zinc-500">No Personal Records set yet. Complete workouts to set PRs!</p>
            ) : (
              <div className="space-y-2.5">
                {recentPrs.map((pr) => (
                  <div key={pr.id} className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-slate-100">{pr.exercise?.name || "Exercise"}</span>
                    </div>
                    <span className="font-bold text-cyan-400">{pr.value} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data-Driven Insights Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>AUTOMATED PROGRESS INSIGHTS</span>
            </h3>

            <div className="space-y-3">
              {insights.map((ins, idx) => (
                <div key={idx} className="bg-zinc-950 border border-cyan-500/20 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-200">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
