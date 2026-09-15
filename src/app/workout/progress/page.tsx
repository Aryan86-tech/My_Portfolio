"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  TrendingUp,
  Trophy,
  Dumbbell,
  Sparkles,
  ArrowLeft,
  Calendar,
  Activity,
} from "lucide-react";

export default function WorkoutProgressPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [performedExercises, setPerformedExercises] = useState<any[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [progressData, setProgressData] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState("30");

  useEffect(() => {
    fetchPerformedExercises();
  }, []);

  useEffect(() => {
    if (selectedExerciseId) {
      fetchExerciseProgress(selectedExerciseId);
    }
  }, [selectedExerciseId]);

  const fetchPerformedExercises = async () => {
    try {
      const res = await fetch("/api/workout/progress");
      if (res.ok) {
        const data = await res.json();
        const exList = data.performedExercises || [];
        setPerformedExercises(exList);
        if (exList.length > 0) {
          setSelectedExerciseId(exList[0].exerciseId);
        }
      }
    } catch (err) {
      console.error("Fetch performed exercises error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseProgress = async (exId: string) => {
    try {
      const res = await fetch(`/api/workout/progress?exerciseId=${exId}`);
      if (res.ok) {
        const data = await res.json();
        setProgressData(data.progressData || []);
        setPrs(data.prs || []);
      }
    } catch (err) {
      console.error("Fetch progress data error:", err);
    }
  };

  const selectedExerciseObj = performedExercises.find((e) => e.exerciseId === selectedExerciseId);
  const selectedName = selectedExerciseObj?.exerciseNameSnapshot || selectedExerciseObj?.exercise?.name || "Exercise";

  // Calculate highest 1RM
  const highest1RM = progressData.reduce((max, item) => Math.max(max, item.estimated1RM || 0), 0);
  const heaviestWeight = progressData.reduce((max, item) => Math.max(max, item.maxWeight || 0), 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/workout")}
              className="p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black font-mono tracking-tight text-slate-100">
                PROGRESSIVE OVERLOAD
              </h1>
              <p className="text-xs font-mono text-zinc-400">
                Track weight progression, volume, and estimated 1RM.
              </p>
            </div>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-xl p-1 font-mono text-xs">
            {["7", "30", "90", "ALL"].map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  timeFilter === f
                    ? "bg-cyan-500 text-zinc-950"
                    : "text-zinc-400 hover:text-slate-200"
                }`}
              >
                {f === "ALL" ? "ALL" : `${f}D`}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Selector */}
        {performedExercises.length > 0 && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase">
              SELECT EXERCISE TO ANALYZE:
            </label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl px-4 py-2 text-xs font-mono text-cyan-300 font-bold outline-none"
            >
              {performedExercises.map((e) => (
                <option key={e.exerciseId} value={e.exerciseId}>
                  {e.exerciseNameSnapshot || e.exercise?.name} ({e.exercise?.muscleGroup})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Exercise Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">HEAVIEST WEIGHT</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-amber-400">{heaviestWeight} kg</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Personal Best</span>
          </div>

          <div className="bg-zinc-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">ESTIMATED 1RM</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-3xl font-black text-cyan-300">{highest1RM} kg</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Epley Formula</span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">TOTAL SESSIONS</span>
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-3xl font-black text-slate-100">{progressData.length}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Recorded Workouts</span>
          </div>
        </div>

        {/* Strength Progression Visual Grid */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 font-mono">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-100 uppercase">
                {selectedName} — PROGRESSION TREND
              </h3>
              <p className="text-xs text-zinc-400">Historical performance by session date.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-cyan-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>LOADING PROGRESSION DATA...</span>
            </div>
          ) : progressData.length === 0 ? (
            <div className="text-center py-12 bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-xs text-zinc-500">
              Not enough data yet. Complete sessions containing <strong>{selectedName}</strong> to view overload trends!
            </div>
          ) : (
            <div className="space-y-3">
              {progressData.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-200 block">{item.date}</span>
                      <span className="text-[10px] text-zinc-500">
                        Max Weight: {item.maxWeight}kg • Max Reps: {item.maxReps}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">SESSION VOLUME</span>
                      <span className="text-xs font-bold text-slate-200">{item.totalVolume.toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold block uppercase">EST 1RM</span>
                      <span className="text-xs font-black text-cyan-300">{item.estimated1RM} kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
