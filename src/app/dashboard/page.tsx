"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PlayerHeader } from "@/components/layout/PlayerHeader";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import { XpHistoryModal } from "@/components/rpg/XpHistoryModal";
import { DailyScoreModal } from "@/components/rpg/DailyScoreModal";
import { StreakHeatmap } from "@/components/rpg/StreakHeatmap";
import {
  CheckCircle,
  Circle,
  Dumbbell,
  Droplet,
  Scale,
  Sparkles,
  Zap,
  Info,
  ArrowRight,
  ShieldCheck,
  Plus,
  Apple,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [waterMl, setWaterMl] = useState(0);
  const [noSugar, setNoSugar] = useState(true);
  const [noJunk, setNoJunk] = useState(true);
  const [recentXpBonus, setRecentXpBonus] = useState<string | null>(null);

  // Modals State
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showXpHistory, setShowXpHistory] = useState(false);
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

  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [todayNutrition, setTodayNutrition] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUserData(data);

      fetchTodayQuests();
      fetchTodaySchedule();
      fetchTodayNutrition();
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayNutrition = async () => {
    try {
      const res = await fetch("/api/nutrition/today");
      if (res.ok) {
        const data = await res.json();
        setTodayNutrition(data);
      }
    } catch (err) {
      console.error("Fetch today nutrition error:", err);
    }
  };

  const fetchTodaySchedule = async () => {
    try {
      const res = await fetch("/api/workout/schedule");
      if (res.ok) {
        const data = await res.json();
        const todayNum = new Date().getDay();
        const sched = (data.schedules || []).find((s: any) => s.dayOfWeek === todayNum);
        setTodayWorkout(sched || null);
      }
    } catch (err) {
      console.error("Fetch schedule error:", err);
    }
  };

  const fetchTodayQuests = async () => {
    try {
      const res = await fetch("/api/quests/today");
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests || []);
        setWaterMl(data.waterMl || 0);
        setNoSugar(data.noSugar ?? true);
        setNoJunk(data.noJunk ?? true);
      }
    } catch {
      // Fallback
    }
  };

  const handleCompleteQuest = async (questId: string, currentStatus: boolean, xpReward: number) => {
    try {
      // Optimistic UI update
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, isCompleted: !currentStatus } : q))
      );

      const res = await fetch("/api/quests/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: questId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.xpEarned) {
          triggerXpAnimation(`+${data.xpEarned} XP`);
        }
        fetchDashboardData();

        // Level Up Trigger Check
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
      console.error("Failed to toggle quest completion:", err);
    }
  };

  const handleAddWater = async (amount: number) => {
    const newAmount = waterMl + amount;
    setWaterMl(newAmount);
    triggerXpAnimation(`+${amount}ml Water`);
    try {
      await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl: newAmount }),
      });
    } catch (err) {
      console.error("Water update error:", err);
    }
  };

  const triggerXpAnimation = (msg: string) => {
    setRecentXpBonus(msg);
    setTimeout(() => setRecentXpBonus(null), 2500);
  };

  if (loading) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  const profile = userData?.profile || {};
  const activeArc = userData?.activeWinterArc;
  const username = userData?.user?.username || "Warrior";
  const totalXp = profile.totalXp || 0;
  const streak = profile.currentStreak || 0;
  const longestStreak = profile.longestStreak || 14;
  const currentWeight = profile.currentWeight || 84.2;
  const targetWeight = profile.targetWeight || 75.0;
  const weightUnit = profile.unitPreference || "kg";

  const remainingWeight = Math.max(0, currentWeight - targetWeight).toFixed(1);

  // Daily Score calculation
  const completedCount = quests.filter((q) => q.isCompleted).length;
  const totalCount = Math.max(1, quests.length);
  const disciplineScore = Math.round((completedCount / totalCount) * 100);
  const fitnessScore = 80;
  const nutritionScore = (noSugar ? 50 : 0) + (noJunk ? 50 : 0);
  const recoveryScore = 90;
  const dailyScore = Math.round(fitnessScore * 0.3 + nutritionScore * 0.25 + disciplineScore * 0.25 + recoveryScore * 0.2);

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

      {/* XP Transaction History Modal */}
      <XpHistoryModal
        isOpen={showXpHistory}
        onClose={() => setShowXpHistory(false)}
      />

      {/* Daily Score Explanation Modal */}
      <DailyScoreModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        fitnessScore={fitnessScore}
        nutritionScore={nutritionScore}
        disciplineScore={disciplineScore}
        recoveryScore={recoveryScore}
        overallScore={dailyScore}
      />

      {/* XP Toast Notification */}
      {recentXpBonus && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-cyan-600 to-teal-500 text-zinc-950 font-mono font-black px-4 py-2 rounded-xl shadow-2xl animate-bounce flex items-center gap-2 text-xs">
          <Zap className="w-4 h-4" />
          <span>{recentXpBonus}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* 1. PLAYER HEADER */}
        <PlayerHeader
          username={username}
          totalXp={totalXp}
          currentStreak={streak}
          activeWinterArc={activeArc}
        />

        {/* QUICK SYSTEM LINKS BAR */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl font-mono text-xs shadow-lg">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-2">SYSTEM:</span>
          <button
            onClick={() => router.push("/progress")}
            className="bg-zinc-950 hover:bg-zinc-800 text-cyan-400 font-bold px-3 py-1.5 rounded-xl border border-zinc-800 transition-all"
          >
            Progression Analytics
          </button>
          <button
            onClick={() => router.push("/progress/weekly")}
            className="bg-zinc-950 hover:bg-zinc-800 text-teal-400 font-bold px-3 py-1.5 rounded-xl border border-zinc-800 transition-all"
          >
            Weekly Review
          </button>
          <button
            onClick={() => router.push("/calendar")}
            className="bg-zinc-950 hover:bg-zinc-800 text-emerald-400 font-bold px-3 py-1.5 rounded-xl border border-zinc-800 transition-all"
          >
            Calendar & Heatmap
          </button>
          <button
            onClick={() => router.push("/achievements")}
            className="bg-zinc-950 hover:bg-zinc-800 text-amber-400 font-bold px-3 py-1.5 rounded-xl border border-zinc-800 transition-all"
          >
            Achievements
          </button>
        </div>

        {/* 2. TODAY'S SCORE & QUICK ACTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today's Score Card */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-cyan-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  TODAY'S DISCIPLINE SCORE
                </span>
                <div className="text-4xl sm:text-5xl font-black text-slate-100 font-mono mt-1">
                  {dailyScore}%
                </div>
              </div>
              <button
                onClick={() => setShowScoreModal(true)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-cyan-400 transition-colors"
                title="How score is calculated"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Fitness (30%)</span>
                <span className="text-cyan-400 font-bold">{fitnessScore}%</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Nutrition (25%)</span>
                <span className="text-emerald-400 font-bold">{nutritionScore}%</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Discipline (25%)</span>
                <span className="text-purple-400 font-bold">{disciplineScore}%</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">Recovery (20%)</span>
                <span className="text-amber-400 font-bold">{recoveryScore}%</span>
              </div>
            </div>
          </div>

          {/* Today's Workout Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  TODAY'S WORKOUT
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  {todayWorkout?.isRestDay
                    ? "REST DAY"
                    : todayWorkout?.template?.name || "SCHEDULED WORKOUT"}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100 font-mono uppercase">
                {todayWorkout?.isRestDay
                  ? "ACTIVE RECOVERY & REST"
                  : todayWorkout?.template?.description ||
                    todayWorkout?.template?.name ||
                    "PUSH DAY — STRENGTH"}
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                {todayWorkout?.isRestDay
                  ? "Take time to recover, hydrate, and stretch."
                  : todayWorkout?.template?.exercises?.length
                  ? `${todayWorkout.template.exercises.length} Exercises Scheduled`
                  : "Check workout home to start your routine."}
              </p>
            </div>

            <button
              onClick={() => router.push(todayWorkout?.isRestDay ? "/workout" : "/workout")}
              className="mt-4 w-full bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs transition-all"
            >
              <Dumbbell className="w-4 h-4" />
              <span>{todayWorkout?.isRestDay ? "VIEW WORKOUT SYSTEM" : "START WORKOUT"}</span>
            </button>
          </div>

          {/* Body Progress Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  BODY PROGRESS
                </span>
                <button
                  onClick={() => router.push("/body")}
                  className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Update</span>
                </button>
              </div>

              <div className="flex items-baseline justify-between font-mono">
                <div>
                  <span className="text-2xl font-black text-slate-100">
                    {currentWeight} {weightUnit}
                  </span>
                  <span className="text-xs text-zinc-500 ml-1">Current</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-cyan-400">
                    {targetWeight} {weightUnit}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">Target</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-zinc-950 h-2 rounded-full border border-zinc-800 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: "65%" }}
                  />
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mt-2 text-right">
                  <strong className="text-slate-200">{remainingWeight} {weightUnit}</strong> remaining
                </p>
              </div>
            </div>
          </div>

          {/* Nutrition Summary Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between font-mono">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  NUTRITION SUMMARY
                </span>
                <button
                  onClick={() => router.push("/nutrition")}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Apple className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-400">Sugar:</span>
                  <span className={`font-bold ${todayNutrition?.noAddedSugar ? "text-emerald-400" : "text-rose-400"}`}>
                    {todayNutrition?.noAddedSugar ? "✓ Clean" : "Broken"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-400">Junk:</span>
                  <span className={`font-bold ${todayNutrition?.noJunkFood ? "text-emerald-400" : "text-amber-400"}`}>
                    {todayNutrition?.noJunkFood ? "✓ Clean" : "Broken"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-400">Protein:</span>
                  <span className="text-amber-400 font-bold">
                    {Math.round(todayNutrition?.proteinGrams || 0)}/{todayNutrition?.proteinGoalGrams || 150}g
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-400">Water:</span>
                  <span className="text-cyan-400 font-bold">
                    {((todayNutrition?.waterMl || 0) / 1000).toFixed(1)}/{(todayNutrition?.waterGoalMl || 3000) / 1000}L
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/nutrition")}
              className="mt-3 w-full bg-zinc-800 hover:bg-zinc-700 text-slate-100 font-mono font-bold py-2 rounded-xl text-xs transition-all border border-zinc-700 flex items-center justify-center gap-1.5"
            >
              <span>NUTRITION SYSTEM</span>
            </button>
          </div>
        </div>

        {/* 3. TODAY'S QUESTS SECTION */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
            <div>
              <h2 className="text-lg font-black font-mono tracking-tight text-slate-100">
                TODAY'S QUESTS
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                Complete daily missions to earn XP and level up.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowXpHistory(true)}
                className="text-xs font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1 mr-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>XP Log</span>
              </button>
              <button
                onClick={() => router.push("/quests")}
                className="text-xs font-mono font-bold text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Manage Quests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {quests.length === 0 ? (
              [
                { id: "q1", name: "Complete Today's Workout", category: "Fitness", xpReward: 100, isCompleted: false },
                { id: "q2", name: "Drink 3L Water", category: "Nutrition", xpReward: 30, isCompleted: waterMl >= 3000 },
                { id: "q3", name: "No Junk Food", category: "Nutrition", xpReward: 50, isCompleted: noJunk },
                { id: "q4", name: "No Added Sugar", category: "Nutrition", xpReward: 50, isCompleted: noSugar },
                { id: "q5", name: "Study / Deep Work 2 Hours", category: "Discipline", xpReward: 50, isCompleted: false },
              ].map((quest) => (
                <div
                  key={quest.id}
                  onClick={() => handleCompleteQuest(quest.id, quest.isCompleted, quest.xpReward)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                    quest.isCompleted
                      ? "bg-cyan-950/20 border-cyan-500/40 text-zinc-400"
                      : "bg-zinc-950 border-zinc-800 text-slate-100 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {quest.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
                    )}
                    <span className={`text-sm font-mono font-medium ${quest.isCompleted ? "line-through text-zinc-500" : ""}`}>
                      {quest.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                    +{quest.xpReward} XP
                  </span>
                </div>
              ))
            ) : (
              quests.map((quest) => (
                <div
                  key={quest.id}
                  onClick={() => handleCompleteQuest(quest.id, quest.isCompleted, quest.xpReward)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                    quest.isCompleted
                      ? "bg-cyan-950/20 border-cyan-500/40 text-zinc-400"
                      : "bg-zinc-950 border-zinc-800 text-slate-100 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {quest.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
                    )}
                    <span className={`text-sm font-mono font-medium ${quest.isCompleted ? "line-through text-zinc-500" : ""}`}>
                      {quest.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                    +{quest.xpReward} XP
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. STREAK HEATMAP */}
        <StreakHeatmap currentStreak={streak} longestStreak={longestStreak} />

        {/* 5. QUICK NUTRITION & WATER TRACKERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200">WATER TRACKER</span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {(waterMl / 1000).toFixed(1)}L / 3.0L
              </span>
            </div>

            <div className="w-full bg-zinc-950 h-2 rounded-full border border-zinc-800 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (waterMl / 3000) * 100)}%` }}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleAddWater(250)}
                className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-xs font-mono font-bold py-2 rounded-xl text-cyan-300 transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> 250ml
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-xs font-mono font-bold py-2 rounded-xl text-cyan-300 transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> 500ml
              </button>
              <button
                onClick={() => handleAddWater(1000)}
                className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-xs font-mono font-bold py-2 rounded-xl text-cyan-300 transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> 1L
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-mono font-bold text-slate-200 block">NUTRITION DISCIPLINE</span>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setNoSugar(!noSugar)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  noSugar
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500"
                }`}
              >
                <div className="text-[10px] font-mono uppercase font-bold text-zinc-400">NO ADDED SUGAR</div>
                <div className="text-sm font-black font-mono mt-1 flex items-center gap-1">
                  {noSugar ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>CLEAN ✓</span>
                    </>
                  ) : (
                    <span>RESET TODAY</span>
                  )}
                </div>
              </div>

              <div
                onClick={() => setNoJunk(!noJunk)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  noJunk
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500"
                }`}
              >
                <div className="text-[10px] font-mono uppercase font-bold text-zinc-400">NO JUNK FOOD</div>
                <div className="text-sm font-black font-mono mt-1 flex items-center gap-1">
                  {noJunk ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>CLEAN ✓</span>
                    </>
                  ) : (
                    <span>RESET TODAY</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
