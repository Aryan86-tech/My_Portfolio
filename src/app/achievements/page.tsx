"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PlayerHeader } from "@/components/layout/PlayerHeader";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import {
  Trophy,
  Lock,
  CheckCircle2,
  Zap,
  Flame,
  Dumbbell,
  Apple,
  Scale,
  Snowflake,
  Sparkles,
  Award,
} from "lucide-react";

export default function AchievementsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [unlockedToast, setUnlockedToast] = useState<string | null>(null);

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
    fetchAchievementsData();
  }, []);

  const fetchAchievementsData = async () => {
    try {
      const [uRes, aRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/achievements"),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUserData(u);
      }

      if (aRes.ok) {
        const a = await aRes.json();
        setAchievements(a.achievements || []);
      }

      // Check for new unlocks automatically
      const checkRes = await fetch("/api/achievements/check", { method: "POST" });
      if (checkRes.ok) {
        const cData = await checkRes.json();
        if (cData.unlockedNow && cData.unlockedNow.length > 0) {
          setUnlockedToast(`Achievement Unlocked: ${cData.unlockedNow[0].name} (+${cData.unlockedNow[0].xpReward} XP)`);
          setTimeout(() => setUnlockedToast(null), 3000);
        }
        if (cData.levelUpData?.didLevelUp) {
          setLevelUpState({
            isOpen: true,
            oldLevel: cData.levelUpData.oldLevel,
            newLevel: cData.levelUpData.newLevel,
            newRank: cData.levelUpData.newRank,
          });
        }
      }
    } catch (err) {
      console.error("Achievements data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-cyan-400 flex flex-col items-center justify-center font-mono">
        <Sparkles className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest">LOADING ACHIEVEMENTS...</span>
      </div>
    );
  }

  const profile = userData?.profile || {};
  const username = userData?.user?.username || "Warrior";
  const activeArc = userData?.activeWinterArc;

  const categories = ["ALL", "Consistency", "Fitness", "Nutrition", "Body", "XP", "Winter Arc"];

  const filteredAchievements = achievements.filter((a) => {
    if (selectedCategory === "ALL") return true;
    return a.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

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

      {/* Unlock Toast */}
      {unlockedToast && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-mono font-black px-4 py-2.5 rounded-xl shadow-2xl animate-bounce flex items-center gap-2 text-xs">
          <Trophy className="w-4 h-4" />
          <span>{unlockedToast}</span>
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
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>WINTER ARC ACHIEVEMENTS</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Unlock milestones across consistency, fitness, nutrition, and XP.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">UNLOCKED</span>
            <span className="text-2xl font-black text-amber-400">
              {unlockedCount} / {achievements.length}
            </span>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-amber-500 text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-slate-200"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ACHIEVEMENTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((ach) => (
            <div
              key={ach.id || ach.code}
              className={`border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all ${
                ach.isUnlocked
                  ? "bg-zinc-900/90 border-amber-500/40"
                  : "bg-zinc-950/80 border-zinc-800/80 opacity-80"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        ach.isUnlocked
                          ? "bg-amber-950/60 border-amber-500/50 text-amber-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      }`}
                    >
                      {ach.isUnlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                        {ach.category}
                      </span>
                      <h3 className="text-sm font-black text-slate-100">{ach.name}</h3>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    +{ach.xpReward} XP
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {ach.description}
                </p>
              </div>

              {/* Progress Meter */}
              <div className="space-y-1.5 pt-3 border-t border-zinc-800/80">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500 font-bold uppercase">
                    {ach.isUnlocked ? "UNLOCKED ✓" : `${ach.currentVal} / ${ach.targetVal}`}
                  </span>
                  <span className="font-bold text-amber-400">{ach.progressPct}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full border border-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      ach.isUnlocked ? "bg-amber-400" : "bg-cyan-500"
                    }`}
                    style={{ width: `${ach.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
