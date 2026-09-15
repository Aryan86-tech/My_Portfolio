"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PlayerHeader } from "@/components/layout/PlayerHeader";
import {
  Dumbbell,
  Play,
  Calendar,
  Layers,
  BookOpen,
  TrendingUp,
  History,
  Trophy,
  CheckCircle2,
  Moon,
  Clock,
  Sparkles,
} from "lucide-react";

export default function WorkoutHomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [prRecords, setPrRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchWorkoutHomeData();
  }, []);

  const fetchWorkoutHomeData = async () => {
    try {
      const [userRes, sessionRes, schedRes, histRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/workout/session"),
        fetch("/api/workout/schedule"),
        fetch("/api/workout/history"),
      ]);

      if (userRes.ok) {
        const uData = await userRes.json();
        setUserData(uData);
      }

      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setActiveSession(sData.activeSession || null);
      }

      if (schedRes.ok) {
        const scData = await schedRes.json();
        setSchedules(scData.schedules || []);
      }

      if (histRes.ok) {
        const hData = await histRes.json();
        setRecentSessions(hData.sessions || []);
      }
    } catch (err) {
      console.error("Workout home data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async (templateId?: string) => {
    try {
      const res = await fetch("/api/workout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (res.ok) {
        router.push("/workout/today");
      }
    } catch (err) {
      console.error("Start workout error:", err);
    }
  };

  const profile = userData?.profile || {};
  const activeArc = userData?.activeWinterArc;
  const username = userData?.user?.username || "Warrior";

  // Map today's day of week (0 = Sun, 1 = Mon... 6 = Sat)
  const todayDayNum = new Date().getDay();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayAbbrs = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Find today's scheduled template
  const todaySchedule = schedules.find((s) => s.dayOfWeek === todayDayNum);
  const isRestDay = todaySchedule?.isRestDay || (!todaySchedule?.templateId && todayDayNum === 4); // Thu rest default fallback

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Player Header */}
        <PlayerHeader
          username={username}
          totalXp={profile.totalXp || 0}
          currentStreak={profile.currentStreak || 0}
          activeWinterArc={activeArc}
        />

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => router.push("/workout/templates")}
            className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 w-fit mb-2 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-mono font-bold text-slate-100">TEMPLATES</h3>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Push/Pull/Legs Splits</p>
          </button>

          <button
            onClick={() => router.push("/workout/exercises")}
            className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 w-fit mb-2 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-mono font-bold text-slate-100">EXERCISES</h3>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Library & Custom</p>
          </button>

          <button
            onClick={() => router.push("/workout/history")}
            className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 w-fit mb-2 group-hover:scale-105 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-mono font-bold text-slate-100">HISTORY</h3>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Past Session Logs</p>
          </button>

          <button
            onClick={() => router.push("/workout/progress")}
            className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 text-left transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 w-fit mb-2 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-mono font-bold text-slate-100">STRENGTH</h3>
            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">Overload Charts & 1RM</p>
          </button>
        </div>

        {/* TODAY'S WORKOUT FEATURE CARD */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  TODAY'S SCHEDULE • {dayNames[todayDayNum].toUpperCase()}
                </span>
              </div>

              {activeSession && (
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  SESSION IN PROGRESS
                </span>
              )}
            </div>

            {activeSession ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
                    {activeSession.name}
                  </h2>
                  <p className="text-xs font-mono text-cyan-300 mt-1">
                    Active session started. Resume to log sets and reps.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/workout/today")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-mono font-black px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm transition-all"
                >
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>RESUME WORKOUT</span>
                </button>
              </div>
            ) : isRestDay ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-950 border border-zinc-800 text-indigo-400 rounded-2xl">
                    <Moon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black font-mono text-slate-100">
                      SCHEDULED REST DAY
                    </h2>
                    <p className="text-xs font-mono text-zinc-400">
                      Recovery is part of progression. Allow muscles to rebuild.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStartWorkout()}
                    className="bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-slate-200 font-mono font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all"
                  >
                    <Dumbbell className="w-4 h-4 text-cyan-400" />
                    <span>START EXTRA WORKOUT ANYWAY</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
                    {todaySchedule?.template?.name || "PUSH DAY"}
                  </h2>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    {todaySchedule?.template?.exercises?.length || 6} Exercises • Target Volume Session
                  </p>
                </div>

                <button
                  onClick={() => handleStartWorkout(todaySchedule?.templateId || undefined)}
                  className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-cyan-950/80 flex items-center gap-2 text-sm transition-all"
                >
                  <Play className="w-5 h-5 fill-zinc-950" />
                  <span>START WORKOUT</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 7-DAY WEEKLY SCHEDULE VISUALIZATION */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                WEEKLY WORKOUT SCHEDULE
              </h3>
            </div>
            <button
              onClick={() => router.push("/workout/schedule")}
              className="text-xs font-mono text-cyan-400 hover:underline font-bold"
            >
              Customize Schedule
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
              const isToday = dayIdx === todayDayNum;
              const sched = schedules.find((s) => s.dayOfWeek === dayIdx);
              const templateName = sched?.isRestDay
                ? "REST"
                : sched?.template?.name || (dayIdx === 4 || dayIdx === 0 ? "REST" : "WORKOUT");

              return (
                <div
                  key={dayIdx}
                  className={`p-3 rounded-xl border text-center font-mono flex flex-col justify-between aspect-square sm:aspect-auto ${
                    isToday
                      ? "bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold shadow-md shadow-cyan-950"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {dayAbbrs[dayIdx]}
                  </span>
                  <span className="text-xs font-black truncate my-1 block">
                    {templateName}
                  </span>
                  {sched?.template && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mx-auto" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT WORKOUT HISTORY & RECENT PRS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Workouts */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                RECENT SESSIONS
              </span>
              <button
                onClick={() => router.push("/workout/history")}
                className="text-[11px] font-mono text-cyan-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {recentSessions.length === 0 ? (
                <p className="text-xs font-mono text-zinc-500 py-4 text-center">
                  No completed sessions yet. Start your first workout today!
                </p>
              ) : (
                recentSessions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">{s.name}</span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(s.startedAt).toLocaleDateString()} • {Math.round((s.durationSeconds || 3600) / 60)} min
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-cyan-400 font-bold font-mono block">
                        {s.totalVolume.toLocaleString()} kg
                      </span>
                      <span className="text-[10px] text-zinc-500">{s.totalSets} sets</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Personal Records Highlight */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                  PERSONAL RECORDS
                </span>
              </div>
              <button
                onClick={() => router.push("/workout/progress")}
                className="text-[11px] font-mono text-cyan-400 hover:underline"
              >
                Progress Charts
              </button>
            </div>

            <div className="space-y-2">
              {[
                { name: "Bench Press", weight: "70 kg", reps: "8 reps", e1rm: "88.7 kg" },
                { name: "Barbell Squat", weight: "105 kg", reps: "6 reps", e1rm: "122.5 kg" },
                { name: "Deadlift", weight: "140 kg", reps: "5 reps", e1rm: "158.7 kg" },
              ].map((pr) => (
                <div
                  key={pr.name}
                  className="flex justify-between items-center p-3 rounded-xl bg-zinc-950 border border-amber-500/20 text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{pr.name}</span>
                    <span className="text-[10px] text-amber-400/90 font-bold">
                      Est 1RM: {pr.e1rm}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-black text-sm font-mono block">
                      {pr.weight}
                    </span>
                    <span className="text-[10px] text-zinc-500">{pr.reps}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
