"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, ArrowRight, ShieldCheck, X } from "lucide-react";
import { getRankFromLevel } from "@/lib/services/rpgEngine";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  oldRank?: string;
  newRank?: string;
}

export function LevelUpModal({
  isOpen,
  onClose,
  oldLevel,
  newLevel,
  newRank,
}: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#22d3ee", "#38bdf8", "#f59e0b"],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rankInfo = getRankFromLevel(newLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 text-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-slate-100 p-1.5 rounded-xl bg-zinc-800/60"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Level Up Icon */}
        <div className="w-20 h-20 rounded-3xl bg-cyan-950/90 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-xl shadow-cyan-950 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PROGRESSION UNLOCKED</span>
        </div>

        <h2 className="text-3xl font-black font-mono tracking-tight text-slate-100 mb-4">
          LEVEL UP!
        </h2>

        {/* Level Jump Badge */}
        <div className="flex items-center justify-center gap-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-6">
          <div className="text-center">
            <span className="text-[10px] font-mono text-zinc-500 block uppercase">PREVIOUS</span>
            <span className="text-2xl font-black font-mono text-zinc-400">LVL {oldLevel}</span>
          </div>

          <ArrowRight className="w-6 h-6 text-cyan-400 animate-pulse" />

          <div className="text-center">
            <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">NEW LEVEL</span>
            <span className="text-3xl font-black font-mono text-cyan-300">LVL {newLevel}</span>
          </div>
        </div>

        {/* Rank Promotion */}
        <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-3.5 mb-6 flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-mono text-slate-200">
            CURRENT RANK: <strong style={{ color: rankInfo.color }}>{rankInfo.badge} {rankInfo.name}</strong>
          </span>
        </div>

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black py-3 rounded-xl shadow-lg shadow-cyan-950 text-sm transition-all"
        >
          CLAIM & CONTINUE QUESTS
        </button>
      </div>
    </div>
  );
}
