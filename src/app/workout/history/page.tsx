"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  History,
  Clock,
  Dumbbell,
  Trophy,
  Sparkles,
  ArrowLeft,
  X,
  Calendar,
} from "lucide-react";

export default function WorkoutHistoryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/workout/history");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setLoading(false);
    }
  };

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
                WORKOUT HISTORY
              </h1>
              <p className="text-xs font-mono text-zinc-400">
                Immutable records of completed gym sessions.
              </p>
            </div>
          </div>
        </div>

        {/* History Sessions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 font-mono text-xs text-cyan-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>LOADING WORKOUT HISTORY...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-3 font-mono">
              <p className="text-xs text-zinc-400">
                No completed workout history recorded yet. Complete your first session to build history!
              </p>
              <button
                onClick={() => router.push("/workout")}
                className="inline-flex items-center gap-2 bg-cyan-500 text-zinc-950 font-black text-xs px-4 py-2 rounded-xl"
              >
                START WORKOUT
              </button>
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedSession(s)}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-mono text-slate-100">{s.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(s.completedAt || s.startedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {Math.round((s.durationSeconds || 3600) / 60)} min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-right font-mono border-t sm:border-t-0 border-zinc-800/80 pt-2 sm:pt-0">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">VOLUME</span>
                    <span className="text-sm font-bold text-cyan-400">
                      {s.totalVolume.toLocaleString()} kg
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">SETS / REPS</span>
                    <span className="text-sm font-bold text-slate-200">
                      {s.totalSets} sets ({s.totalReps})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold block uppercase">XP</span>
                    <span className="text-sm font-black text-cyan-300">+{s.xpEarned} XP</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAILED PAST SESSION MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-black font-mono text-slate-100">
                  {selectedSession.name}
                </h2>
                <span className="text-xs font-mono text-cyan-400">
                  {new Date(selectedSession.completedAt || selectedSession.startedAt).toLocaleDateString()} • {Math.round((selectedSession.durationSeconds || 3600) / 60)} mins
                </span>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-zinc-400 hover:text-slate-100 p-1.5 rounded-xl bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {selectedSession.exercises.map((se: any, idx: number) => (
                <div key={se.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="font-bold text-slate-200">
                      {idx + 1}. {se.exerciseNameSnapshot || se.exercise?.name}
                    </span>
                    <span className="text-[10px] text-cyan-400 uppercase">{se.exercise?.muscleGroup}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                    {se.sets.map((set: any) => (
                      <span
                        key={set.id}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${
                          set.isPr
                            ? "bg-amber-950/60 border-amber-500/50 text-amber-300"
                            : "bg-zinc-900 border-zinc-800 text-zinc-300"
                        }`}
                      >
                        Set {set.setNumber}: {set.weight}kg × {set.reps} {set.isPr ? "🏆 PR" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
