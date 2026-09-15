"use client";

import React from "react";
import { Info, X, Dumbbell, Apple, CheckSquare, HeartPulse } from "lucide-react";

interface DailyScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  fitnessScore?: number;
  nutritionScore?: number;
  disciplineScore?: number;
  recoveryScore?: number;
  overallScore?: number;
}

export function DailyScoreModal({
  isOpen,
  onClose,
  fitnessScore = 80,
  nutritionScore = 100,
  disciplineScore = 75,
  recoveryScore = 90,
  overallScore = 86,
}: DailyScoreModalProps) {
  if (!isOpen) return null;

  const categories = [
    {
      name: "Fitness (30%)",
      score: fitnessScore,
      icon: Dumbbell,
      color: "text-cyan-400",
      description: "Based on completing scheduled workout sessions and exercise volume.",
    },
    {
      name: "Nutrition (25%)",
      score: nutritionScore,
      icon: Apple,
      color: "text-emerald-400",
      description: "Based on maintaining No Added Sugar, No Junk Food, and water hydration target.",
    },
    {
      name: "Discipline (25%)",
      score: disciplineScore,
      icon: CheckSquare,
      color: "text-purple-400",
      description: "Based on percentage of daily quests and daily habit completions.",
    },
    {
      name: "Recovery (20%)",
      score: recoveryScore,
      icon: HeartPulse,
      color: "text-amber-400",
      description: "Based on rest days, sleep quality goals, and stress management.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-mono text-slate-100">DAILY SCORE CALCULATION</h2>
              <p className="text-xs font-mono text-zinc-400">Weighted discipline metrics engine.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-slate-100 p-1.5 rounded-xl bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="text-center bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
              TODAY'S OVERALL DISCIPLINE SCORE
            </span>
            <span className="text-4xl font-black font-mono text-cyan-300 block mt-1">
              {overallScore}%
            </span>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                      <span className="font-bold text-slate-200">{cat.name}</span>
                    </div>
                    <span className={`font-black ${cat.color}`}>{cat.score}%</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500">{cat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
