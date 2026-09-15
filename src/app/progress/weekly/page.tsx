"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PlayerHeader } from "@/components/layout/PlayerHeader";
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sparkles,
  ArrowLeft,
  Save,
  Zap,
  Dumbbell,
  Apple,
} from "lucide-react";

export default function WeeklyReviewPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);

  // Manual Reflection Form State
  const [wentWell, setWentWell] = useState("");
  const [didntGoWell, setDidntGoWell] = useState("");
  const [nextWeekPlan, setNextWeekPlan] = useState("");
  const [notes, setNotes] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const [uRes, wRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/progress/weekly"),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUserData(u);
      }

      if (wRes.ok) {
        const w = await wRes.json();
        setWeeklyData(w);
        if (w.reflection) {
          setWentWell(w.reflection.wentWell || "");
          setDidntGoWell(w.reflection.didntGoWell || "");
          setNextWeekPlan(w.reflection.nextWeekPlan || "");
          setNotes(w.reflection.notes || "");
        }
      }
    } catch (err) {
      console.error("Weekly data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weeklyData?.weekStartDate) return;

    try {
      const res = await fetch("/api/progress/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStartDate: weeklyData.weekStartDate,
          wentWell,
          didntGoWell,
          nextWeekPlan,
          notes,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save reflection error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-cyan-400 flex flex-col items-center justify-center font-mono">
        <Sparkles className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest">LOADING WEEKLY REVIEW...</span>
      </div>
    );
  }

  const profile = userData?.profile || {};
  const username = userData?.user?.username || "Warrior";
  const activeArc = userData?.activeWinterArc;

  const thisWeek = weeklyData?.thisWeek || {};
  const prevWeek = weeklyData?.prevWeek || {};
  const comparison = weeklyData?.comparison || {};
  const wins: string[] = weeklyData?.wins || [];
  const improve: string[] = weeklyData?.improve || [];

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

        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/progress")}
              className="p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-slate-100 border border-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-100 uppercase">
                WEEKLY REVIEW & REFLECTION
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Week of {weeklyData?.weekStartDate} — {weeklyData?.weekEndDate}
              </p>
            </div>
          </div>
        </div>

        {/* 1. THIS WEEK VS LAST WEEK COMPARISON MATRIX */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-black text-slate-100 tracking-tight border-b border-zinc-800/80 pb-3">
            THIS WEEK vs LAST WEEK COMPARISON
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">XP EARNED</span>
              <div className="text-2xl font-black text-slate-100 mt-1">{thisWeek.xp || 0} XP</div>
              <div className="flex items-center gap-1 text-xs mt-2">
                <span className="text-zinc-500">vs Last Week ({prevWeek.xp || 0})</span>
                <span className={`font-bold ml-auto ${comparison.xpChangePct >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {comparison.xpChangePct >= 0 ? `+${comparison.xpChangePct}%` : `${comparison.xpChangePct}%`}
                </span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">WORKOUTS</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">{thisWeek.workouts || 0} / 5</div>
              <div className="flex items-center gap-1 text-xs mt-2">
                <span className="text-zinc-500">vs Last Week ({prevWeek.workouts || 0})</span>
                <span className="font-bold text-cyan-400 ml-auto">
                  {comparison.workoutsDiff >= 0 ? `+${comparison.workoutsDiff}` : comparison.workoutsDiff}
                </span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">AVG SCORE</span>
              <div className="text-2xl font-black text-teal-400 mt-1">{thisWeek.avgScore || 85}%</div>
              <div className="text-xs text-zinc-500 mt-2">Discipline score avg</div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">PRs SET</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{thisWeek.prs || 0}</div>
              <div className="text-xs text-zinc-500 mt-2">New Personal Records</div>
            </div>
          </div>
        </div>

        {/* 2. AUTOMATED WINS & AREAS TO IMPROVE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wins Card */}
          <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-emerald-400 tracking-tight flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>WEEKLY WINS</span>
            </h3>

            <div className="space-y-3">
              {wins.map((w, idx) => (
                <div key={idx} className="bg-zinc-950 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Areas to Improve Card */}
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-amber-400 tracking-tight flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>AREAS TO IMPROVE</span>
            </h3>

            <div className="space-y-3">
              {improve.map((imp, idx) => (
                <div key={idx} className="bg-zinc-950 border border-amber-500/20 p-3.5 rounded-xl text-xs text-slate-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. MANUAL WEEKLY REFLECTION FORM */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
            <h3 className="text-base font-black text-slate-100 tracking-tight">
              MANUAL WEEKLY REFLECTION
            </h3>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Reflection Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReflection} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                What went well this week?
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Hit all 4 workouts, stayed consistent with protein intake..."
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                What didn't go as planned?
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Missed water goal on Wednesday due to busy work schedule..."
                value={didntGoWell}
                onChange={(e) => setDidntGoWell(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                What will you improve next week?
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Prepare water bottle in morning, schedule Thursday workout early..."
                value={nextWeekPlan}
                onChange={(e) => setNextWeekPlan(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                Additional Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Energy levels were great on Push Day Heavy"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>SAVE WEEKLY REFLECTION</span>
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
