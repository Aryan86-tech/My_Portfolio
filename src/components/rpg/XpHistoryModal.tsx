"use client";

import React, { useEffect, useState } from "react";
import { Zap, X, Clock, Award } from "lucide-react";

interface XpTransaction {
  id: string;
  amount: number;
  source: string;
  description: string;
  createdAt: string;
}

interface XpHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function XpHistoryModal({ isOpen, onClose }: XpHistoryModalProps) {
  const [transactions, setTransactions] = useState<XpTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchXpHistory();
    }
  }, [isOpen]);

  const fetchXpHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/xp/history");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch XP history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 border border-cyan-500/30 text-cyan-400 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-mono text-slate-100">XP TRANSACTION HISTORY</h2>
              <p className="text-xs font-mono text-zinc-400">Detailed breakdown of why you gained XP.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-slate-100 p-1.5 rounded-xl bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Feed */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
          {loading ? (
            <div className="text-center py-8 text-xs font-mono text-cyan-400">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-zinc-500">
              No XP transactions recorded yet. Complete quests or workouts to earn XP!
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-zinc-900 text-cyan-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">{tx.description}</span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <span
                  className={`font-black font-mono text-sm px-2.5 py-1 rounded-lg border ${
                    tx.amount >= 0
                      ? "text-cyan-400 bg-cyan-950/60 border-cyan-500/30"
                      : "text-rose-400 bg-rose-950/60 border-rose-500/30"
                  }`}
                >
                  {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} XP
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
