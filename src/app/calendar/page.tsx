"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PlayerHeader } from "@/components/layout/PlayerHeader";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Dumbbell,
  Apple,
  CheckCircle2,
  XCircle,
  Zap,
  Scale,
  X,
  Droplet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // Day Summary Modal
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySummary, setDaySummary] = useState<any>(null);
  const [loadingDay, setLoadingDay] = useState(false);

  useEffect(() => {
    fetchCalendarPageData(currentMonth);
  }, [currentMonth]);

  const fetchCalendarPageData = async (monthStr: string) => {
    try {
      const [uRes, cRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/calendar?month=${monthStr}`),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUserData(u);
      }

      if (cRes.ok) {
        const c = await cRes.json();
        setCalendarData(c);
      }
    } catch (err) {
      console.error("Calendar data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDaySummary = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setLoadingDay(true);
    try {
      const res = await fetch(`/api/calendar?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setDaySummary(data);
      }
    } catch (err) {
      console.error("Fetch day summary error:", err);
    } finally {
      setLoadingDay(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-cyan-400 flex flex-col items-center justify-center font-mono">
        <Sparkles className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest">LOADING CALENDAR & HISTORY...</span>
      </div>
    );
  }

  const profile = userData?.profile || {};
  const username = userData?.user?.username || "Warrior";
  const activeArc = userData?.activeWinterArc;

  const daysMap: Record<string, any> = calendarData?.daysMap || {};

  // Build month grid days
  const [yearNum, monthNum] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const firstDayOfWeek = new Date(yearNum, monthNum - 1, 1).getDay(); // 0 = Sun

  return (
    <AppShell>
      {/* DAY SUMMARY MODAL */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl font-mono relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => {
                setSelectedDate(null);
                setDaySummary(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-zinc-800 pb-3">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                HISTORICAL DAY SUMMARY
              </span>
              <h3 className="text-xl font-black text-slate-100 mt-0.5">
                {selectedDate}
              </h3>
            </div>

            {loadingDay ? (
              <div className="py-12 text-center text-xs text-cyan-400">Loading Day Summary...</div>
            ) : daySummary ? (
              <div className="space-y-4 text-xs">
                {/* 1. Daily Score & XP */}
                <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">DAILY SCORE</span>
                    <span className="text-lg font-black text-cyan-400">
                      {daySummary.dailyScore ? `${daySummary.dailyScore}%` : "No Score"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">XP EARNED</span>
                    <span className="text-lg font-black text-emerald-400">
                      +{daySummary.totalXp} XP
                    </span>
                  </div>
                </div>

                {/* 2. Quests */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
                  <span className="font-bold text-slate-200 uppercase text-[10px] block">QUESTS COMPLETED</span>
                  {daySummary.questsCompleted?.length === 0 ? (
                    <span className="text-zinc-500">No quests completed on this date.</span>
                  ) : (
                    <div className="space-y-1">
                      {daySummary.questsCompleted?.map((q: any) => (
                        <div key={q.id} className="flex justify-between items-center text-zinc-300">
                          <span>✓ {q.name}</span>
                          <span className="text-amber-400 font-bold">+{q.xp} XP</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Workout */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
                  <span className="font-bold text-slate-200 uppercase text-[10px] block flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                    <span>WORKOUT SESSION</span>
                  </span>
                  {daySummary.workout ? (
                    <div>
                      <span className="font-bold text-cyan-400">{daySummary.workout.name}</span>
                      <p className="text-zinc-400 mt-1">
                        Volume: {daySummary.workout.totalVolume}kg • Sets: {daySummary.workout.totalSets} • Reps: {daySummary.workout.totalReps}
                      </p>
                    </div>
                  ) : (
                    <span className="text-zinc-500">No workout session completed on this date.</span>
                  )}
                </div>

                {/* 4. Nutrition & Hydration */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
                  <span className="font-bold text-slate-200 uppercase text-[10px] block flex items-center gap-1">
                    <Apple className="w-3.5 h-3.5 text-emerald-400" />
                    <span>NUTRITION & HYDRATION</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-zinc-300">
                    <div>Sugar: <strong className={daySummary.nutrition?.noAddedSugar ? "text-emerald-400" : "text-rose-400"}>{daySummary.nutrition?.noAddedSugar ? "Clean" : "Broken"}</strong></div>
                    <div>Junk: <strong className={daySummary.nutrition?.noJunkFood ? "text-emerald-400" : "text-amber-400"}>{daySummary.nutrition?.noJunkFood ? "Clean" : "Broken"}</strong></div>
                    <div>Protein: <strong className="text-amber-400">{daySummary.nutrition?.proteinGrams || 0}g</strong></div>
                    <div>Water: <strong className="text-cyan-400">{(daySummary.waterMl / 1000).toFixed(1)}L</strong></div>
                  </div>
                </div>

                {/* 5. Weight */}
                {daySummary.weight && (
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">RECORDED WEIGHT</span>
                    <span className="font-bold text-slate-100">{daySummary.weight} kg</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="space-y-6 font-mono">
        {/* PLAYER HEADER */}
        <PlayerHeader
          username={username}
          totalXp={profile.totalXp || 0}
          currentStreak={profile.currentStreak || 0}
          activeWinterArc={activeArc}
        />

        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-teal-400" />
              <span>WINTER ARC CALENDAR & HISTORY</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Monthly activity grid and contribution heatmap. Click any date for day details.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
            <button
              onClick={() => {
                const prevM = new Date(yearNum, monthNum - 2, 1).toISOString().slice(0, 7);
                setCurrentMonth(prevM);
              }}
              className="p-1 text-zinc-400 hover:text-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-100 px-2">{currentMonth}</span>
            <button
              onClick={() => {
                const nextM = new Date(yearNum, monthNum, 1).toISOString().slice(0, 7);
                setCurrentMonth(nextM);
              }}
              className="p-1 text-zinc-400 hover:text-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. GITHUB-STYLE WINTER ARC CONTRIBUTION HEATMAP */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-slate-100 tracking-tight">
            WINTER ARC ACTIVITY HEATMAP
          </h3>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {Array.from({ length: 30 }).map((_, i) => {
              const dayStr = `${currentMonth}-${String(i + 1).padStart(2, "0")}`;
              const dayData = daysMap[dayStr];
              let levelClass = "bg-zinc-950 border-zinc-800";
              if (dayData) {
                if (dayData.score >= 85 && dayData.hasWorkout) levelClass = "bg-emerald-500 text-zinc-950 font-bold border-emerald-400";
                else if (dayData.score >= 70) levelClass = "bg-teal-600 text-zinc-950 border-teal-500";
                else levelClass = "bg-cyan-900/60 text-cyan-300 border-cyan-700/50";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOpenDaySummary(dayStr)}
                  className={`w-9 h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] transition-all hover:scale-110 ${levelClass}`}
                  title={`${dayStr}: ${dayData ? `${dayData.score}% Score` : "No activity"}`}
                >
                  <span>{i + 1}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/80">
            <span>Activity Level:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-zinc-950 border border-zinc-800" />
              <span>None</span>
              <span className="w-3 h-3 rounded bg-cyan-900/60 border border-cyan-700/50" />
              <span>Low</span>
              <span className="w-3 h-3 rounded bg-teal-600 border border-teal-500" />
              <span>Moderate</span>
              <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400" />
              <span>Excellent</span>
            </div>
          </div>
        </div>

        {/* 2. MONTHLY CALENDAR GRID */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-slate-100 tracking-tight">
            MONTHLY CALENDAR VIEW ({currentMonth})
          </h3>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-400 mb-2">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-20 bg-zinc-950/40 border border-zinc-900 rounded-xl" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentMonth}-${String(dayNum).padStart(2, "0")}`;
              const dayData = daysMap[dateStr];

              return (
                <div
                  key={dateStr}
                  onClick={() => handleOpenDaySummary(dateStr)}
                  className="h-20 bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 rounded-xl p-2 flex flex-col justify-between cursor-pointer transition-all hover:bg-zinc-900"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-200">{dayNum}</span>
                    {dayData && (
                      <span className="text-[9px] font-bold text-cyan-400">{Math.round(dayData.score)}%</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {dayData?.hasWorkout && <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />}
                    {dayData?.noJunk && <Apple className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
