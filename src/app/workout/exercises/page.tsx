"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Dumbbell,
  Sparkles,
  X,
  ArrowLeft,
  Info,
} from "lucide-react";

export default function ExercisesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("ALL");
  const [selectedEquipment, setSelectedEquipment] = useState("ALL");

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formMuscle, setFormMuscle] = useState("Chest");
  const [formEquipment, setFormEquipment] = useState("Barbell");
  const [formInstructions, setFormInstructions] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const muscleGroups = [
    "ALL",
    "Chest",
    "Back",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Quadriceps",
    "Hamstrings",
    "Glutes",
    "Calves",
    "Core",
    "Full Body",
  ];

  const equipmentTypes = [
    "ALL",
    "Barbell",
    "Dumbbell",
    "Machine",
    "Cable",
    "Bodyweight",
    "Other",
  ];

  useEffect(() => {
    fetchExercises();
  }, [searchQuery, selectedMuscle, selectedEquipment]);

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedMuscle !== "ALL") params.append("muscleGroup", selectedMuscle);
      if (selectedEquipment !== "ALL") params.append("equipment", selectedEquipment);

      const res = await fetch(`/api/workout/exercises?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExercises(data.exercises || []);
      }
    } catch (err) {
      console.error("Fetch exercises error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Exercise name is required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/workout/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          muscleGroup: formMuscle,
          equipment: formEquipment,
          instructions: formInstructions,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create exercise.");
      }

      setShowCreateModal(false);
      setFormName("");
      setFormInstructions("");
      fetchExercises();
    } catch (err: any) {
      setFormError(err.message || "Failed to save exercise.");
    } finally {
      setSubmitting(false);
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
                EXERCISE LIBRARY
              </h1>
              <p className="text-xs font-mono text-zinc-400">
                Search and explore movements or add custom exercises.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>CUSTOM EXERCISE</span>
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise e.g. Bench Press..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-mono text-slate-100 outline-none"
            />
          </div>

          {/* Muscle Group Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-4 h-4 text-zinc-500 shrink-0 ml-1" />
            {muscleGroups.map((group) => {
              const isSelected = selectedMuscle === group;
              return (
                <button
                  key={group}
                  onClick={() => setSelectedMuscle(group)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-cyan-500 text-zinc-950 font-bold border border-cyan-400 shadow-md"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-slate-200"
                  }`}
                >
                  {group.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 font-mono text-xs text-cyan-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>LOADING EXERCISES...</span>
            </div>
          ) : exercises.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-3">
              <p className="text-xs font-mono text-zinc-400">
                No exercises found matching your search.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                CREATE CUSTOM EXERCISE
              </button>
            </div>
          ) : (
            exercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-black font-mono text-slate-100">{ex.name}</h3>
                    {ex.isCustom && (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                        CUSTOM
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span className="text-cyan-400 font-bold uppercase">{ex.muscleGroup}</span>
                    <span>•</span>
                    <span>{ex.equipment}</span>
                  </div>
                </div>

                {ex.instructions && (
                  <p className="text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80 pt-2 line-clamp-2">
                    {ex.instructions}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE CUSTOM EXERCISE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h2 className="text-lg font-black font-mono text-slate-100">
                CREATE CUSTOM EXERCISE
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

            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Bulgarian Split Squat"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                    Muscle Group
                  </label>
                  <select
                    value={formMuscle}
                    onChange={(e) => setFormMuscle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                  >
                    {muscleGroups
                      .filter((m) => m !== "ALL")
                      .map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                    Equipment
                  </label>
                  <select
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                  >
                    {equipmentTypes
                      .filter((eq) => eq !== "ALL")
                      .map((eq) => (
                        <option key={eq} value={eq}>
                          {eq}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                  Instructions / Form Notes (Optional)
                </label>
                <textarea
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="e.g. Keep chest upright and descend slowly..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none resize-none"
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-zinc-950 font-mono text-xs font-black hover:bg-cyan-400"
                >
                  SAVE EXERCISE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
