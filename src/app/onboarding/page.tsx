"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Snowflake,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Target,
  Scale,
  Calendar as CalendarIcon,
  Dumbbell,
  Droplet,
  Flame,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [username, setUsername] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [currentWeight, setCurrentWeight] = useState("84.2");
  const [targetWeight, setTargetWeight] = useState("75.0");
  const [unitPreference, setUnitPreference] = useState("kg");
  const [duration, setDuration] = useState<number>(90);
  const [customDays, setCustomDays] = useState("45");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([
    "Workout",
    "Walking 10k Steps",
    "No Added Sugar",
    "No Junk Food",
    "Meditation / Deep Work",
    "Read 15 Pages",
  ]);
  const [waterGoalMl, setWaterGoalMl] = useState("3000");
  const [isCompleted, setIsCompleted] = useState(false);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.username) {
          setUsername(data.user.username);
        }
      })
      .catch(() => {});
  }, []);

  const availableGoals = [
    { id: "lose_weight", label: "Lose Weight & Cut Fat" },
    { id: "build_muscle", label: "Build Muscle & Strength" },
    { id: "improve_discipline", label: "Master Personal Discipline" },
    { id: "improve_fitness", label: "Improve Athletic Conditioning" },
    { id: "better_habits", label: "Build Rock-Solid Habits" },
    { id: "self_improvement", label: "General Self-Improvement" },
  ];

  const availableHabits = [
    "Workout",
    "Walking 10k Steps",
    "No Added Sugar",
    "No Junk Food",
    "Meditation / Deep Work",
    "Read 15 Pages",
    "Sleep on Time (8 hrs)",
    "Cold Shower",
    "Study 2 Hours",
  ];

  const toggleGoal = (goalLabel: string) => {
    if (selectedGoals.includes(goalLabel)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goalLabel));
    } else {
      setSelectedGoals([...selectedGoals, goalLabel]);
    }
  };

  const toggleHabit = (habitLabel: string) => {
    if (selectedHabits.includes(habitLabel)) {
      setSelectedHabits(selectedHabits.filter((h) => h !== habitLabel));
    } else {
      setSelectedHabits([...selectedHabits, habitLabel]);
    }
  };

  const handleNext = () => {
    setError("");
    if (step < 9) {
      setStep(step + 1);
    } else {
      submitOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    setError("");

    try {
      const actualDuration = duration === 0 ? Number(customDays) || 30 : duration;

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          mainGoals: selectedGoals,
          currentWeight,
          targetWeight,
          unitPreference,
          winterArcDuration: actualDuration,
          startDate,
          customHabits: selectedHabits,
          waterGoalMl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Onboarding failed.");
      }

      setIsCompleted(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save setup.");
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-cyan-950/90 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 mb-6 shadow-2xl shadow-cyan-950 animate-bounce">
          <Snowflake className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-cyan-300 mb-2">
          YOUR WINTER ARC BEGINS NOW.
        </h1>
        <p className="text-sm font-mono text-zinc-400 max-w-md">
          Starter quests generated. Level 1 initialized. Prepare for day 1.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-mono text-cyan-400 mb-2 font-bold">
            <span>STEP {step} OF 9</span>
            <span>{Math.round((step / 9) * 100)}% COMPLETE</span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full border border-zinc-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 9) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {/* STEP 1: USERNAME */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-mono">STEP 1: USERNAME</h2>
                <p className="text-xs text-zinc-400 font-mono">Define your call sign for the Arc.</p>
              </div>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Shadow_Athlete"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-3 text-sm font-mono text-slate-100 outline-none"
            />
          </div>
        )}

        {/* STEP 2: MAIN GOALS */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-mono">STEP 2: MAIN GOALS</h2>
                <p className="text-xs text-zinc-400 font-mono">Select your primary focus areas.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableGoals.map((g) => {
                const isSelected = selectedGoals.includes(g.label);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGoal(g.label)}
                    className={`p-3 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span>{g.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: CURRENT WEIGHT */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-mono">STEP 3: CURRENT WEIGHT</h2>
                <p className="text-xs text-zinc-400 font-mono">Log your baseline starting body weight.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="84.2"
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-3 text-sm font-mono text-slate-100 outline-none"
              />
              <select
                value={unitPreference}
                onChange={(e) => setUnitPreference(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-cyan-400 font-mono px-4 rounded-xl font-bold"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 4: TARGET WEIGHT */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-mono">STEP 4: TARGET WEIGHT</h2>
                <p className="text-xs text-zinc-400 font-mono">Set your end goal body weight.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="75.0"
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-3 text-sm font-mono text-slate-100 outline-none"
              />
              <div className="bg-zinc-950 border border-zinc-800 text-cyan-400 font-mono px-4 rounded-xl flex items-center font-bold">
                {unitPreference}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DURATION */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-mono">STEP 5: WINTER ARC DURATION</h2>
                <p className="text-xs text-zinc-400 font-mono">Choose your challenge duration.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[30, 60, 90, 0].map((d) => {
                const label = d === 0 ? "Custom" : `${d} Days`;
                const isSelected = duration === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`p-4 rounded-xl border text-center font-mono font-bold text-sm transition-all ${
                      isSelected
                        ? "bg-cyan-950 border-cyan-500 text-cyan-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {duration === 0 && (
              <input
                type="number"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="Custom days e.g. 45"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-3 text-sm font-mono text-slate-100 outline-none"
              />
            )}
          </div>
        )}

        {/* STEP 6: START DATE */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-mono">STEP 6: START DATE</h2>
                <p className="text-xs text-zinc-400 font-mono">Select when your Winter Arc officially starts.</p>
              </div>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-3 text-sm font-mono text-slate-100 outline-none"
            />
          </div>
        )}

        {/* STEP 7: WORKOUT SCHEDULE */}
        {step === 7 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-mono">STEP 7: WORKOUT SCHEDULE</h2>
                <p className="text-xs text-zinc-400 font-mono">Standard 4-Day Push/Pull/Legs Split initialized.</p>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 text-xs font-mono text-zinc-300">
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-cyan-400 font-bold">MON • PUSH</span>
                <span>Chest, Shoulders, Triceps</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-cyan-400 font-bold">TUE • PULL</span>
                <span>Back, Biceps, Rear Delts</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-cyan-400 font-bold">WED • LEGS</span>
                <span>Quads, Hamstrings, Calves</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-cyan-400 font-bold">THU • REST</span>
                <span>Recovery & Walking</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyan-400 font-bold">FRI • UPPER</span>
                <span>Upper Body Power</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: DAILY HABITS */}
        {step === 8 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-mono">STEP 8: DAILY HABITS</h2>
                <p className="text-xs text-zinc-400 font-mono">Select daily habits to track.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableHabits.map((h) => {
                const isSelected = selectedHabits.includes(h);
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleHabit(h)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <span>{h}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 9: WATER GOAL */}
        {step === 9 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-mono">STEP 9: DAILY WATER TARGET</h2>
                <p className="text-xs text-zinc-400 font-mono">Set your daily hydration goal in milliliters.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                step="250"
                value={waterGoalMl}
                onChange={(e) => setWaterGoalMl(e.target.value)}
                placeholder="3000"
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-3 text-sm font-mono text-slate-100 outline-none"
              />
              <div className="bg-zinc-950 border border-zinc-800 text-cyan-400 font-mono px-4 rounded-xl flex items-center font-bold">
                mL ({ (parseInt(waterGoalMl) || 3000) / 1000 }L)
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-zinc-800">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </button>
          ) : <div />}

          <button
            onClick={handleNext}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-950/60 flex items-center gap-2 text-xs transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>SAVING SETUP...</span>
            ) : (
              <>
                <span>{step === 9 ? "INITIALIZE ARC" : "NEXT STEP"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
