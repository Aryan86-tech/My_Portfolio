"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import {
  Dumbbell,
  Clock,
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  Trophy,
  Zap,
  Flame,
  ArrowLeft,
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function ActiveWorkoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const [previousPerformanceMap, setPreviousPerformanceMap] = useState<Record<string, any[]>>({});
  const [unit, setUnit] = useState<"kg" | "lb">("kg");

  // Workout Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Rest Timer
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);

  // Completion Summary State
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Level Up State
  const [levelUpState, setLevelUpState] = useState<{
    isOpen: boolean;
    oldLevel: number;
    newLevel: number;
    newRank?: string;
  }>({
    isOpen: false,
    oldLevel: 1,
    newLevel: 1,
  });

  useEffect(() => {
    fetchActiveSession();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    let interval: any = null;
    if (restTimerSeconds !== null && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTimerSeconds]);

  const fetchActiveSession = async () => {
    try {
      // First check for existing active session
      let res = await fetch("/api/workout/session");
      let data = await res.json();

      let active = data.activeSession;

      // If no active session, start quick workout
      if (!active) {
        const startRes = await fetch("/api/workout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Workout Session" }),
        });
        const startData = await startRes.json();
        active = startData.session;
      }

      if (active) {
        // Fetch detailed session with previous performance
        const detailRes = await fetch(`/api/workout/session/${active.id}`);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setSession(detailData.session);
          setPreviousPerformanceMap(detailData.previousPerformanceMap || {});

          // Calculate initial elapsed time
          const start = new Date(detailData.session.startedAt).getTime();
          const now = new Date().getTime();
          setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
        }
      }
    } catch (err) {
      console.error("Failed to load active workout:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetComplete = async (sessionExerciseId: string, setId: string, currentCompleted: boolean) => {
    if (!session) return;

    // Optimistic update
    setSession((prev: any) => ({
      ...prev,
      exercises: prev.exercises.map((se: any) =>
        se.id === sessionExerciseId
          ? {
              ...se,
              sets: se.sets.map((s: any) =>
                s.id === setId ? { ...s, completed: !currentCompleted } : s
              ),
            }
          : se
      ),
    }));

    // Start 90s rest timer if completing set
    if (!currentCompleted) {
      setRestTimerSeconds(90);
    }

    try {
      await fetch(`/api/workout/session/${session.id}/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SET",
          setId,
          completed: !currentCompleted,
        }),
      });
    } catch (err) {
      console.error("Update set error:", err);
    }
  };

  const handleUpdateSetInput = async (setId: string, field: "weight" | "reps", val: string) => {
    const numVal = parseFloat(val) || 0;

    // Optimistic update
    setSession((prev: any) => ({
      ...prev,
      exercises: prev.exercises.map((se: any) => ({
        ...se,
        sets: se.sets.map((s: any) => (s.id === setId ? { ...s, [field]: numVal } : s)),
      })),
    }));

    try {
      await fetch(`/api/workout/session/${session.id}/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SET",
          setId,
          [field]: numVal,
        }),
      });
    } catch (err) {
      console.error("Update set input error:", err);
    }
  };

  const handleAddSet = async (sessionExerciseId: string) => {
    try {
      const res = await fetch(`/api/workout/session/${session.id}/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_SET",
          sessionExerciseId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession((prev: any) => ({
          ...prev,
          exercises: prev.exercises.map((se: any) =>
            se.id === sessionExerciseId
              ? { ...se, sets: [...se.sets, data.set] }
              : se
          ),
        }));
      }
    } catch (err) {
      console.error("Add set error:", err);
    }
  };

  const handleDeleteSet = async (sessionExerciseId: string, setId: string) => {
    try {
      await fetch(`/api/workout/session/${session.id}/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_SET",
          setId,
        }),
      });

      setSession((prev: any) => ({
        ...prev,
        exercises: prev.exercises.map((se: any) =>
          se.id === sessionExerciseId
            ? { ...se, sets: se.sets.filter((s: any) => s.id !== setId) }
            : se
        ),
      }));
    } catch (err) {
      console.error("Delete set error:", err);
    }
  };

  const handleFinishWorkout = async () => {
    if (!session) return;

    try {
      const res = await fetch(`/api/workout/session/${session.id}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds: elapsedSeconds }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummaryData(data.summary);
        setShowSummary(true);

        if (data.levelUpData && data.levelUpData.didLevelUp) {
          setLevelUpState({
            isOpen: true,
            oldLevel: data.levelUpData.oldLevel,
            newLevel: data.levelUpData.newLevel,
            newRank: data.levelUpData.newRank,
          });
        }
      }
    } catch (err) {
      console.error("Finish workout error:", err);
    }
  };

  const handleDiscardWorkout = async () => {
    if (!session) return;
    if (confirm("Discard this workout session? No XP or workout data will be saved.")) {
      try {
        await fetch(`/api/workout/session/${session.id}`, { method: "DELETE" });
        router.push("/workout");
      } catch (err) {
        console.error("Discard error:", err);
      }
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-cyan-400 flex flex-col items-center justify-center font-mono">
        <Sparkles className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest">LOADING ACTIVE WORKOUT...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <AppShell>
        <div className="text-center py-12 font-mono space-y-4">
          <p className="text-xs text-zinc-400">No active workout session found.</p>
          <button
            onClick={() => router.push("/workout")}
            className="bg-cyan-500 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold font-mono"
          >
            Go to Workout Home
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={levelUpState.isOpen}
        onClose={() => setLevelUpState((prev) => ({ ...prev, isOpen: false }))}
        oldLevel={levelUpState.oldLevel}
        newLevel={levelUpState.newLevel}
        newRank={levelUpState.newRank}
      />

      <div className="space-y-6">
        {/* Sticky Header with Timer & Controls */}
        <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 pb-4 pt-2 -mx-4 px-4 sm:-mx-8 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/workout")}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-black font-mono text-slate-100 uppercase tracking-tight">
                  {session.name}
                </h1>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(elapsedSeconds)}</span>
                  <span className="text-zinc-700">•</span>
                  <span>{session.exercises.length} EXERCISES</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Unit Toggle */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex font-mono text-xs">
                <button
                  onClick={() => setUnit("kg")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    unit === "kg" ? "bg-cyan-500 text-zinc-950" : "text-zinc-400"
                  }`}
                >
                  KG
                </button>
                <button
                  onClick={() => setUnit("lb")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    unit === "lb" ? "bg-cyan-500 text-zinc-950" : "text-zinc-400"
                  }`}
                >
                  LB
                </button>
              </div>

              {/* Finish Workout */}
              <button
                onClick={handleFinishWorkout}
                className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black px-4 py-2 rounded-xl text-xs shadow-lg shadow-cyan-950"
              >
                FINISH WORKOUT
              </button>
            </div>
          </div>
        </div>

        {/* Rest Timer Floating Banner */}
        {restTimerSeconds !== null && (
          <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-zinc-950 border border-purple-500/40 rounded-2xl p-4 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400 text-purple-300 flex items-center justify-center font-mono font-bold text-sm">
                {restTimerSeconds}s
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-slate-100 block">REST TIMER</span>
                <span className="text-[10px] font-mono text-purple-300">Catch your breath before next set.</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRestTimerSeconds(60)}
                className="px-2.5 py-1 rounded-lg bg-purple-900/40 border border-purple-500/30 text-[11px] font-mono text-purple-200"
              >
                +60s
              </button>
              <button
                onClick={() => setRestTimerSeconds(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Exercise Cards List */}
        <div className="space-y-6">
          {session.exercises.map((se: any) => {
            const lastSets = previousPerformanceMap[se.exerciseId] || [];

            return (
              <div
                key={se.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4"
              >
                {/* Exercise Header */}
                <div className="flex justify-between items-start border-b border-zinc-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                        EXERCISE {se.orderIndex + 1}
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {se.exercise.muscleGroup}
                      </span>
                    </div>
                    <h2 className="text-lg font-black font-mono text-slate-100">
                      {se.exerciseNameSnapshot || se.exercise.name}
                    </h2>
                  </div>
                </div>

                {/* PREVIOUS PERFORMANCE REFERENCE DISPLAY */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 text-xs font-mono space-y-1">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                    LAST SESSION PERFORMANCE
                  </span>
                  {lastSets.length === 0 ? (
                    <span className="text-zinc-500 text-[11px]">First time performing this exercise!</span>
                  ) : (
                    <div className="flex flex-wrap gap-2 text-zinc-300 font-bold">
                      {lastSets.map((s, idx) => (
                        <span key={idx} className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[11px]">
                          Set {idx + 1}: {s.weight} {unit} × {s.reps}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sets Entry Table */}
                <div className="space-y-3">
                  <div className="grid grid-cols-12 text-[10px] font-mono font-bold text-zinc-500 uppercase px-2">
                    <span className="col-span-2">SET</span>
                    <span className="col-span-4">WEIGHT ({unit.toUpperCase()})</span>
                    <span className="col-span-4">REPS</span>
                    <span className="col-span-2 text-right">DONE</span>
                  </div>

                  {se.sets.map((setItem: any) => (
                    <div
                      key={setItem.id}
                      className={`p-3 rounded-2xl border transition-all space-y-2 ${
                        setItem.completed
                          ? "bg-cyan-950/20 border-cyan-500/40 text-zinc-400"
                          : "bg-zinc-950 border-zinc-800 text-slate-100"
                      }`}
                    >
                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-2 font-mono font-bold text-sm text-zinc-400">
                          #{setItem.setNumber}
                        </span>

                        <div className="col-span-4">
                          <input
                            type="number"
                            step="0.5"
                            value={setItem.weight}
                            onChange={(e) => handleUpdateSetInput(setItem.id, "weight", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-sm font-mono font-bold text-slate-100 text-center outline-none min-h-[44px]"
                          />
                        </div>

                        <div className="col-span-4">
                          <input
                            type="number"
                            value={setItem.reps}
                            onChange={(e) => handleUpdateSetInput(setItem.id, "reps", e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-sm font-mono font-bold text-slate-100 text-center outline-none min-h-[44px]"
                          />
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleSetComplete(se.id, setItem.id, setItem.completed)}
                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-zinc-800/60"
                            aria-label={`Toggle set ${setItem.setNumber}`}
                          >
                            {setItem.completed ? (
                              <CheckCircle className="w-7 h-7 text-cyan-400" />
                            ) : (
                              <Circle className="w-7 h-7 text-zinc-600 hover:text-cyan-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteSet(se.id, setItem.id)}
                            className="text-zinc-600 hover:text-rose-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Delete set"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Incremental Buttons for Gym Fast Logging */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-zinc-900 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-500 text-[10px] uppercase font-bold mr-1">Weight:</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateSetInput(setItem.id, "weight", String(Math.max(0, (setItem.weight || 0) - 2.5)))}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:border-cyan-500 min-h-[32px] min-w-[36px]"
                          >
                            -2.5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSetInput(setItem.id, "weight", String((setItem.weight || 0) + 2.5))}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-cyan-400 hover:border-cyan-500 font-bold min-h-[32px] min-w-[36px]"
                          >
                            +2.5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSetInput(setItem.id, "weight", String((setItem.weight || 0) + 5))}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-cyan-400 hover:border-cyan-500 font-bold min-h-[32px] min-w-[36px]"
                          >
                            +5
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-zinc-500 text-[10px] uppercase font-bold mr-1">Reps:</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateSetInput(setItem.id, "reps", String(Math.max(0, (setItem.reps || 0) - 1)))}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:border-cyan-500 min-h-[32px] min-w-[36px]"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSetInput(setItem.id, "reps", String((setItem.reps || 0) + 1))}
                            className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-cyan-400 hover:border-cyan-500 font-bold min-h-[32px] min-w-[36px]"
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleAddSet(se.id)}
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 text-cyan-400 font-mono font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD SET</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-zinc-800 font-mono text-xs">
          <button
            onClick={handleDiscardWorkout}
            className="text-rose-400 hover:underline"
          >
            DISCARD WORKOUT
          </button>

          <button
            onClick={handleFinishWorkout}
            className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black px-6 py-3 rounded-xl shadow-lg"
          >
            FINISH WORKOUT
          </button>
        </div>
      </div>

      {/* WORKOUT COMPLETE SUMMARY MODAL */}
      {showSummary && summaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-400 text-cyan-400 flex items-center justify-center mx-auto shadow-xl">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                MISSION ACCOMPLISHED
              </span>
              <h2 className="text-2xl font-black font-mono text-slate-100 mt-1">
                WORKOUT COMPLETE!
              </h2>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-left">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">DURATION</span>
                <span className="text-lg font-bold text-slate-100">
                  {Math.round(summaryData.durationSeconds / 60)} MIN
                </span>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">TOTAL VOLUME</span>
                <span className="text-lg font-bold text-cyan-400">
                  {summaryData.totalVolume.toLocaleString()} KG
                </span>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <span className="text-[10px] text-zinc-500 block">TOTAL SETS / REPS</span>
                <span className="text-lg font-bold text-slate-100">
                  {summaryData.totalSets} SETS ({summaryData.totalReps} REPS)
                </span>
              </div>

              <div className="p-3 bg-zinc-950 border border-cyan-500/30 rounded-xl">
                <span className="text-[10px] text-cyan-400 font-bold block">XP EARNED</span>
                <span className="text-lg font-black text-cyan-300">
                  +{summaryData.xpEarned} XP
                </span>
              </div>
            </div>

            {/* PR Detection Alert */}
            {summaryData.prs && summaryData.prs.length > 0 && (
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-left space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs font-bold">
                  <Trophy className="w-4 h-4" />
                  <span>🏆 NEW PERSONAL RECORD DETECTED!</span>
                </div>
                {summaryData.prs.map((pr: any, idx: number) => (
                  <p key={idx} className="text-xs font-mono text-zinc-300">
                    {pr.exerciseName}: <strong>{pr.value}kg</strong> (+25 XP)
                  </p>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/workout")}
              className="w-full bg-cyan-500 text-zinc-950 font-mono font-black py-3 rounded-xl shadow-lg hover:bg-cyan-400 text-sm"
            >
              RETURN TO WORKOUT HUB
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
