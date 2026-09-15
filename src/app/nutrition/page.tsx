"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PlayerHeader } from "@/components/layout/PlayerHeader";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import {
  Apple,
  Droplet,
  Flame,
  Plus,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  Utensils,
  ShieldCheck,
  RotateCcw,
  Info,
  Trash2,
  X,
} from "lucide-react";

export default function NutritionPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [nutritionData, setNutritionData] = useState<any>(null);

  // Quick Action Modals
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showCustomProteinModal, setShowCustomProteinModal] = useState(false);
  const [recentXpBonus, setRecentXpBonus] = useState<string | null>(null);

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

  // Food Form Input
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Snack");
  const [foodName, setFoodName] = useState("");
  const [foodQuantity, setFoodQuantity] = useState("");
  const [foodProtein, setFoodProtein] = useState("");
  const [foodCalories, setFoodCalories] = useState("");

  // Custom Protein Input
  const [customProtein, setCustomProtein] = useState("");

  useEffect(() => {
    fetchNutritionPageData();
  }, []);

  const fetchNutritionPageData = async () => {
    try {
      const [uRes, nRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/nutrition/today"),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUserData(u);
      }

      if (nRes.ok) {
        const n = await nRes.json();
        setNutritionData(n);
      }
    } catch (err) {
      console.error("Nutrition page load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSugar = async () => {
    const current = nutritionData?.noAddedSugar ?? true;
    try {
      const res = await fetch("/api/nutrition/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noAddedSugar: !current }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.xpEarned) {
          triggerXpToast(`+${data.xpEarned} XP (No Sugar Clean)`);
        }
        if (data.levelUpData?.didLevelUp) {
          setLevelUpState({
            isOpen: true,
            oldLevel: data.levelUpData.oldLevel,
            newLevel: data.levelUpData.newLevel,
            newRank: data.levelUpData.newRank,
          });
        }
        fetchNutritionPageData();
      }
    } catch (err) {
      console.error("Toggle sugar error:", err);
    }
  };

  const handleToggleJunk = async () => {
    const current = nutritionData?.noJunkFood ?? true;
    try {
      const res = await fetch("/api/nutrition/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noJunkFood: !current }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.xpEarned) {
          triggerXpToast(`+${data.xpEarned} XP (No Junk Food Clean)`);
        }
        if (data.levelUpData?.didLevelUp) {
          setLevelUpState({
            isOpen: true,
            oldLevel: data.levelUpData.oldLevel,
            newLevel: data.levelUpData.newLevel,
            newRank: data.levelUpData.newRank,
          });
        }
        fetchNutritionPageData();
      }
    } catch (err) {
      console.error("Toggle junk error:", err);
    }
  };

  const handleToggleProcessed = async (status: "ON_TRACK" | "OFF_TRACK") => {
    try {
      const res = await fetch("/api/nutrition/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processedFoodStatus: status }),
      });
      if (res.ok) {
        fetchNutritionPageData();
      }
    } catch (err) {
      console.error("Processed food update error:", err);
    }
  };

  const handleCheckIn = async (status: "CLEAN" | "MOSTLY_CLEAN" | "OFF_TRACK") => {
    try {
      const res = await fetch("/api/nutrition/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkInStatus: status }),
      });
      if (res.ok) {
        fetchNutritionPageData();
      }
    } catch (err) {
      console.error("Check-in error:", err);
    }
  };

  const handleAddProteinGrams = async (grams: number) => {
    try {
      const res = await fetch("/api/nutrition/protein", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountGrams: grams }),
      });

      if (res.ok) {
        const data = await res.json();
        triggerXpToast(`+${grams}g Protein`);
        if (data.xpEarned) {
          triggerXpToast(`+${data.xpEarned} XP (Protein Goal Reached!)`);
        }
        if (data.levelUpData?.didLevelUp) {
          setLevelUpState({
            isOpen: true,
            oldLevel: data.levelUpData.oldLevel,
            newLevel: data.levelUpData.newLevel,
            newRank: data.levelUpData.newRank,
          });
        }
        fetchNutritionPageData();
      }
    } catch (err) {
      console.error("Add protein error:", err);
    }
  };

  const handleAddWaterMl = async (amount: number) => {
    const currentWater = nutritionData?.waterMl || 0;
    const newWater = currentWater + amount;
    triggerXpToast(`+${amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`} Water`);

    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl: newWater }),
      });

      if (res.ok) {
        fetchNutritionPageData();
      }
    } catch (err) {
      console.error("Add water error:", err);
    }
  };

  const handleSaveFoodLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    try {
      const res = await fetch("/api/nutrition/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          foodName,
          quantity: foodQuantity || null,
          protein: foodProtein ? Number(foodProtein) : null,
          calories: foodCalories ? Number(foodCalories) : null,
        }),
      });

      if (res.ok) {
        setShowAddFoodModal(false);
        setFoodName("");
        setFoodQuantity("");
        setFoodProtein("");
        setFoodCalories("");
        fetchNutritionPageData();
      }
    } catch (err) {
      console.error("Save food log error:", err);
    }
  };

  const handleDeleteFoodItem = async (id: string) => {
    try {
      const res = await fetch(`/api/nutrition/food?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchNutritionPageData();
      }
    } catch (err) {
      console.error("Delete food item error:", err);
    }
  };

  const triggerXpToast = (msg: string) => {
    setRecentXpBonus(msg);
    setTimeout(() => setRecentXpBonus(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-cyan-400 flex flex-col items-center justify-center font-mono">
        <Sparkles className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest">LOADING NUTRITION DASHBOARD...</span>
      </div>
    );
  }

  const profile = userData?.profile || {};
  const username = userData?.user?.username || "Warrior";
  const activeArc = userData?.activeWinterArc;

  const noAddedSugar = nutritionData?.noAddedSugar ?? true;
  const noJunkFood = nutritionData?.noJunkFood ?? true;
  const processedFoodStatus = nutritionData?.processedFoodStatus || "ON_TRACK";
  const nutritionScore = nutritionData?.nutritionScore ?? 100;
  const checkInStatus = nutritionData?.checkInStatus;

  const waterMl = nutritionData?.waterMl || 0;
  const waterGoalMl = nutritionData?.waterGoalMl || 3000;
  const waterLitres = (waterMl / 1000).toFixed(1);
  const waterGoalLitres = (waterGoalMl / 1000).toFixed(1);

  const proteinGrams = Math.round(nutritionData?.proteinGrams || 0);
  const proteinGoalGrams = nutritionData?.proteinGoalGrams || 150;

  const foodLogs: any[] = nutritionData?.foodLogs || [];

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

      {/* XP Toast Notification */}
      {recentXpBonus && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-mono font-black px-4 py-2 rounded-xl shadow-2xl animate-bounce flex items-center gap-2 text-xs">
          <Zap className="w-4 h-4" />
          <span>{recentXpBonus}</span>
        </div>
      )}

      {/* ADD FOOD MODAL */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl font-mono relative">
            <button
              onClick={() => setShowAddFoodModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <span>LOG MEAL ITEM</span>
            </h3>

            <form onSubmit={handleSaveFoodLog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                  Meal Category
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                  Food Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eggs + Toast or Chicken Breast"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 35"
                    value={foodProtein}
                    onChange={(e) => setFoodProtein(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                    Calories (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 450"
                    value={foodCalories}
                    onChange={(e) => setFoodCalories(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                SAVE LOG ENTRY
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM PROTEIN MODAL */}
      {showCustomProteinModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl font-mono relative">
            <button
              onClick={() => setShowCustomProteinModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>LOG PROTEIN (GRAMS)</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                  Amount in Grams
                </label>
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => {
                  if (customProtein && Number(customProtein) > 0) {
                    handleAddProteinGrams(Number(customProtein));
                    setShowCustomProteinModal(false);
                    setCustomProtein("");
                  }
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                ADD PROTEIN
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* PLAYER HEADER */}
        <PlayerHeader
          username={username}
          totalXp={profile.totalXp || 0}
          currentStreak={profile.currentStreak || 0}
          activeWinterArc={activeArc}
        />

        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-xl font-mono">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <Apple className="w-6 h-6 text-emerald-400" />
              <span>NUTRITION SYSTEM</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Consistency over perfection. Track clean eating, protein, and water.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">DAILY NUTRITION SCORE</span>
              <span className="text-2xl font-black text-emerald-400">{nutritionScore}%</span>
            </div>
          </div>
        </div>

        {/* 1. DAILY CHECK-IN BANNER */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-emerald-500/20 rounded-2xl p-5 shadow-xl font-mono space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>HOW DID YOU EAT TODAY?</span>
            </span>
            {checkInStatus && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                {checkInStatus.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleCheckIn("CLEAN")}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                checkInStatus === "CLEAN"
                  ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md"
                  : "bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:border-emerald-500/50"
              }`}
            >
              [ CLEAN ]
            </button>
            <button
              onClick={() => handleCheckIn("MOSTLY_CLEAN")}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                checkInStatus === "MOSTLY_CLEAN"
                  ? "bg-teal-500 text-zinc-950 border-teal-400 shadow-md"
                  : "bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:border-teal-500/50"
              }`}
            >
              [ MOSTLY CLEAN ]
            </button>
            <button
              onClick={() => handleCheckIn("OFF_TRACK")}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                checkInStatus === "OFF_TRACK"
                  ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md"
                  : "bg-zinc-950/80 text-zinc-300 border-zinc-800 hover:border-amber-500/50"
              }`}
            >
              [ OFF TRACK ]
            </button>
          </div>
        </div>

        {/* 2. MAIN BEHAVIORAL NUTRITION CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
          {/* NO ADDED SUGAR CARD */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  NO ADDED SUGAR
                </span>
                <span className="text-xs text-cyan-400 font-bold">+50 XP</span>
              </div>
              <h3 className="text-lg font-black text-slate-100">
                SUGAR STATUS
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {noAddedSugar ? "Clean. Zero added sugar today." : "Broken today. Reset and keep going!"}
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={handleToggleSugar}
                className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  noAddedSugar
                    ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-950"
                    : "bg-zinc-800 text-rose-400 border border-rose-900/50 hover:bg-zinc-700"
                }`}
              >
                {noAddedSugar ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CLEAN ✓</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>RESET TODAY</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* NO JUNK FOOD CARD */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  NO JUNK FOOD
                </span>
                <span className="text-xs text-cyan-400 font-bold">+50 XP</span>
              </div>
              <h3 className="text-lg font-black text-slate-100">
                JUNK FOOD STATUS
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {noJunkFood ? "Clean. Zero junk food consumed." : "One meal doesn't define your progress. Reset today!"}
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={handleToggleJunk}
                className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  noJunkFood
                    ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-950"
                    : "bg-zinc-800 text-amber-400 border border-amber-900/50 hover:bg-zinc-700"
                }`}
              >
                {noJunkFood ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CLEAN ✓</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>RESET TODAY</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PROCESSED FOOD CARD */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  PROCESSED FOOD
                </span>
                <span className="text-xs text-emerald-400 font-bold">BEHAVIOR</span>
              </div>
              <h3 className="text-lg font-black text-slate-100">
                WHOLE FOODS FOCUS
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {processedFoodStatus === "ON_TRACK" ? "On Track. Prioritizing whole foods." : "Off Track today. Focus on next meal."}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleToggleProcessed("ON_TRACK")}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  processedFoodStatus === "ON_TRACK"
                    ? "bg-emerald-500 text-zinc-950"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800"
                }`}
              >
                ON TRACK ✓
              </button>
              <button
                onClick={() => handleToggleProcessed("OFF_TRACK")}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  processedFoodStatus === "OFF_TRACK"
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-zinc-950 text-zinc-400 border border-zinc-800"
                }`}
              >
                OFF TRACK
              </button>
            </div>
          </div>
        </div>

        {/* 3. PROTEIN & WATER TRACKERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          {/* PROTEIN TRACKER CARD */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>PROTEIN INTAKE</span>
                </span>
                <span className="text-xs text-amber-400 font-bold">+30 XP Goal</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-black text-slate-100">
                  {proteinGrams} <span className="text-sm font-normal text-zinc-400">/ {proteinGoalGrams} g</span>
                </div>
                <span className="text-xs font-bold text-amber-400">
                  {Math.round((proteinGrams / proteinGoalGrams) * 100)}%
                </span>
              </div>

              <div className="w-full bg-zinc-950 h-3 rounded-full border border-zinc-800 overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((proteinGrams / proteinGoalGrams) * 100))}%` }}
                />
              </div>
            </div>

            {/* Quick Add Protein Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">QUICK ADD PROTEIN:</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleAddProteinGrams(20)}
                  className="bg-zinc-950 hover:bg-amber-950/60 border border-zinc-800 hover:border-amber-500/40 text-amber-300 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  +20g
                </button>
                <button
                  onClick={() => handleAddProteinGrams(30)}
                  className="bg-zinc-950 hover:bg-amber-950/60 border border-zinc-800 hover:border-amber-500/40 text-amber-300 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  +30g
                </button>
                <button
                  onClick={() => handleAddProteinGrams(40)}
                  className="bg-zinc-950 hover:bg-amber-950/60 border border-zinc-800 hover:border-amber-500/40 text-amber-300 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  +40g
                </button>
                <button
                  onClick={() => setShowCustomProteinModal(true)}
                  className="bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  Custom
                </button>
              </div>
            </div>
          </div>

          {/* WATER TRACKER CARD */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>HYDRATION TRACKER</span>
                </span>
                <span className="text-xs text-cyan-400 font-bold">+30 XP Goal</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-black text-slate-100">
                  {waterLitres} <span className="text-sm font-normal text-zinc-400">/ {waterGoalLitres} L</span>
                </div>
                <span className="text-xs font-bold text-cyan-400">
                  {Math.round((waterMl / waterGoalMl) * 100)}%
                </span>
              </div>

              <div className="w-full bg-zinc-950 h-3 rounded-full border border-zinc-800 overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((waterMl / waterGoalMl) * 100))}%` }}
                />
              </div>
            </div>

            {/* Quick Add Water Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">QUICK ADD WATER:</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleAddWaterMl(250)}
                  className="bg-zinc-950 hover:bg-cyan-950/60 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  +250ml
                </button>
                <button
                  onClick={() => handleAddWaterMl(500)}
                  className="bg-zinc-950 hover:bg-cyan-950/60 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  +500ml
                </button>
                <button
                  onClick={() => handleAddWaterMl(750)}
                  className="bg-zinc-950 hover:bg-cyan-950/60 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  +750ml
                </button>
                <button
                  onClick={() => handleAddWaterMl(1000)}
                  className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  +1.0L
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. OPTIONAL FOOD LOG SECTION */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 font-mono">
          <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" />
                <span>TODAY'S MEAL LOG (OPTIONAL)</span>
              </h3>
              <p className="text-xs text-zinc-400">Log meals simply without complex gram counting.</p>
            </div>
            <button
              onClick={() => setShowAddFoodModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ LOG FOOD</span>
            </button>
          </div>

          {foodLogs.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4">No meals logged today. (Optional)</p>
          ) : (
            <div className="space-y-3">
              {foodLogs.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-emerald-400 uppercase tracking-widest text-[10px] mr-2">
                      [{item.mealType}]
                    </span>
                    <span className="font-bold text-slate-100">{item.foodName}</span>
                    {item.quantity && <span className="text-zinc-400 ml-2">({item.quantity})</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    {item.protein && <span className="text-amber-400 font-bold">+{item.protein}g P</span>}
                    {item.calories && <span className="text-zinc-400">{item.calories} kcal</span>}
                    <button
                      onClick={() => handleDeleteFoodItem(item.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
