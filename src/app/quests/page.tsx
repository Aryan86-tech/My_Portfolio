"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PlayerHeader } from "@/components/layout/PlayerHeader";
import { LevelUpModal } from "@/components/rpg/LevelUpModal";
import { XpHistoryModal } from "@/components/rpg/XpHistoryModal";
import {
  Plus,
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  Zap,
  Filter,
  Sparkles,
  X,
  AlertTriangle,
  Calendar,
} from "lucide-react";

export default function QuestsPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modals & UI States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState<any | null>(null);
  const [deletingQuestId, setDeletingQuestId] = useState<string | null>(null);
  const [showXpHistory, setShowXpHistory] = useState(false);

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

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Discipline");
  const [formDifficulty, setFormDifficulty] = useState("MEDIUM");
  const [formCustomXp, setFormCustomXp] = useState("");
  const [formSchedule, setFormSchedule] = useState("DAILY");
  const [formDueDate, setFormDueDate] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const categories = [
    "ALL",
    "Fitness",
    "Nutrition",
    "Discipline",
    "Study",
    "Work",
    "Sleep",
    "Personal",
    "Other",
  ];

  useEffect(() => {
    fetchUserData();
    fetchQuests();
  }, [selectedCategory]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (err) {
      console.error("User data fetch error:", err);
    }
  };

  const fetchQuests = async () => {
    try {
      const url =
        selectedCategory === "ALL"
          ? "/api/quests"
          : `/api/quests?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests || []);
      }
    } catch (err) {
      console.error("Fetch quests error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuest = async (questId: string, currentStatus: boolean, xpReward: number) => {
    try {
      // Optimistic update
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
        fetchUserData();

        // Check if level up triggered
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
      console.error("Toggle quest error:", err);
    }
  };

  const handleOpenCreate = () => {
    setEditingQuest(null);
    setFormName("");
    setFormCategory("Discipline");
    setFormDifficulty("MEDIUM");
    setFormCustomXp("");
    setFormSchedule("DAILY");
    setFormDueDate("");
    setFormError("");
    setShowCreateModal(true);
  };

  const handleOpenEdit = (quest: any) => {
    setEditingQuest(quest);
    setFormName(quest.name);
    setFormCategory(quest.category);
    setFormDifficulty(quest.difficulty);
    setFormCustomXp(quest.xpReward.toString());
    setFormSchedule(quest.scheduleType);
    setFormDueDate(quest.dueDate || "");
    setFormError("");
    setShowCreateModal(true);
  };

  const handleSaveQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Quest name is required.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      const payload = {
        name: formName.trim(),
        category: formCategory,
        difficulty: formDifficulty,
        customXp: formCustomXp,
        scheduleType: formSchedule,
        dueDate: formDueDate || null,
      };

      const url = editingQuest ? `/api/quests/${editingQuest.id}` : "/api/quests";
      const method = editingQuest ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Save quest failed.");
      }

      setShowCreateModal(false);
      fetchQuests();
    } catch (err: any) {
      setFormError(err.message || "Failed to save quest.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteQuest = async (id: string) => {
    try {
      const res = await fetch(`/api/quests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeletingQuestId(null);
        fetchQuests();
      }
    } catch (err) {
      console.error("Delete quest error:", err);
    }
  };

  const profile = userData?.profile || {};
  const activeArc = userData?.activeWinterArc;
  const username = userData?.user?.username || "Warrior";

  const difficultyColors: Record<string, string> = {
    EASY: "border-emerald-500/30 text-emerald-400 bg-emerald-950/40",
    MEDIUM: "border-cyan-500/30 text-cyan-400 bg-cyan-950/40",
    HARD: "border-amber-500/30 text-amber-400 bg-amber-950/40",
    ELITE: "border-purple-500/30 text-purple-400 bg-purple-950/40",
  };

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

      <div className="space-y-6">
        {/* Player Header */}
        <PlayerHeader
          username={username}
          totalXp={profile.totalXp || 0}
          currentStreak={profile.currentStreak || 0}
          activeWinterArc={activeArc}
        />

        {/* Quests Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <div>
            <h1 className="text-xl font-black font-mono tracking-tight text-slate-100">
              QUEST SYSTEM
            </h1>
            <p className="text-xs font-mono text-zinc-400">
              Define daily missions. Turn real-life actions into XP.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowXpHistory(true)}
              className="bg-zinc-950 border border-zinc-800 hover:border-cyan-500 text-cyan-400 font-mono font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>XP LOG</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>NEW QUEST</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0 ml-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-cyan-500 text-zinc-950 font-bold border border-cyan-400 shadow-md"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-slate-200"
                }`}
              >
                {cat.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Quest List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 font-mono text-xs text-cyan-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>LOADING QUEST MISSIONS...</span>
            </div>
          ) : quests.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-3">
              <p className="text-xs font-mono text-zinc-400">
                No active quests found under category <strong>{selectedCategory}</strong>.
              </p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                CREATE YOUR FIRST QUEST
              </button>
            </div>
          ) : (
            quests.map((quest) => (
              <div
                key={quest.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-150 gap-3 ${
                  quest.isCompleted
                    ? "bg-cyan-950/15 border-cyan-500/30 text-zinc-400 opacity-90"
                    : "bg-zinc-900/90 border-zinc-800 text-slate-100 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <button
                    onClick={() => handleToggleQuest(quest.id, quest.isCompleted, quest.xpReward)}
                    className="shrink-0"
                  >
                    {quest.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-zinc-600 hover:text-cyan-400 transition-colors" />
                    )}
                  </button>

                  <div>
                    <h3
                      className={`text-sm font-mono font-bold ${
                        quest.isCompleted ? "line-through text-zinc-500" : "text-slate-100"
                      }`}
                    >
                      {quest.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {quest.category}
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {quest.scheduleType}
                      </span>
                      {quest.dueDate && (
                        <>
                          <span className="text-zinc-700">•</span>
                          <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {quest.dueDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                      difficultyColors[quest.difficulty] || difficultyColors.MEDIUM
                    }`}
                  >
                    {quest.difficulty} • +{quest.xpReward} XP
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(quest)}
                      className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 rounded-xl transition-colors"
                      title="Edit Quest"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingQuestId(quest.id)}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Delete Quest"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE / EDIT QUEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h2 className="text-lg font-black font-mono text-slate-100">
                {editingQuest ? "EDIT QUEST" : "CREATE NEW QUEST"}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-slate-100 p-1.5 rounded-xl bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveQuest} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                  Quest Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Read 20 Pages of Philosophy"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                  >
                    {categories
                      .filter((c) => c !== "ALL")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                    Schedule
                  </label>
                  <select
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKDAYS">Weekdays</option>
                    <option value="ONCE">One-time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                  >
                    <option value="EASY">Easy (10 XP)</option>
                    <option value="MEDIUM">Medium (25 XP)</option>
                    <option value="HARD">Hard (50 XP)</option>
                    <option value="ELITE">Elite (100 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                    Custom XP (Optional)
                  </label>
                  <input
                    type="number"
                    value={formCustomXp}
                    onChange={(e) => setFormCustomXp(e.target.value)}
                    placeholder="e.g. 75"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-xs font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-zinc-950 font-mono text-xs font-black hover:bg-cyan-400 transition-colors"
                >
                  {editingQuest ? "UPDATE QUEST" : "CREATE QUEST"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DESTRUCTIVE CONFIRMATION MODAL */}
      {deletingQuestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-zinc-900 border border-rose-900/60 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-950 text-rose-400 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black font-mono text-slate-100">DELETE QUEST?</h3>
            <p className="text-xs font-mono text-zinc-400">
              This action cannot be undone. Are you sure you want to delete this quest?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingQuestId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-xs font-bold"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleDeleteQuest(deletingQuestId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-slate-100 font-mono text-xs font-black hover:bg-rose-500"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
