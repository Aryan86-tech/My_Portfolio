"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import {
  Layers,
  Plus,
  Edit2,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Dumbbell,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplatesData();
  }, []);

  const fetchTemplatesData = async () => {
    try {
      const [tRes, eRes] = await Promise.all([
        fetch("/api/workout/templates"),
        fetch("/api/workout/exercises"),
      ]);

      if (tRes.ok) {
        const tData = await tRes.json();
        setTemplates(tData.templates || []);
      }

      if (eRes.ok) {
        const eData = await eRes.json();
        setAvailableExercises(eData.exercises || []);
      }
    } catch (err) {
      console.error("Fetch templates error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormName("");
    setFormDescription("");
    setSelectedExerciseIds([]);
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (tpl: any) => {
    setEditingTemplate(tpl);
    setFormName(tpl.name);
    setFormDescription(tpl.description || "");
    setSelectedExerciseIds(tpl.exercises ? tpl.exercises.map((e: any) => e.exerciseId) : []);
    setFormError("");
    setShowModal(true);
  };

  const handleToggleExerciseSelection = (exId: string) => {
    if (selectedExerciseIds.includes(exId)) {
      setSelectedExerciseIds(selectedExerciseIds.filter((id) => id !== exId));
    } else {
      setSelectedExerciseIds([...selectedExerciseIds, exId]);
    }
  };

  const handleMoveExercise = (index: number, direction: "UP" | "DOWN") => {
    const updated = [...selectedExerciseIds];
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < updated.length) {
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      setSelectedExerciseIds(updated);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Template name is required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const payload = {
        name: formName.trim(),
        description: formDescription,
        exerciseIds: selectedExerciseIds,
      };

      const url = editingTemplate ? `/api/workout/templates/${editingTemplate.id}` : "/api/workout/templates";
      const method = editingTemplate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Save template failed.");
      }

      setShowModal(false);
      fetchTemplatesData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save template.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/workout/templates/${id}`, { method: "POST" });
      if (res.ok) {
        fetchTemplatesData();
      }
    } catch (err) {
      console.error("Duplicate error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this workout template? (Historical workout sessions will remain intact)")) {
      try {
        const res = await fetch(`/api/workout/templates/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchTemplatesData();
        }
      } catch (err) {
        console.error("Delete template error:", err);
      }
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
                WORKOUT TEMPLATES
              </h1>
              <p className="text-xs font-mono text-zinc-400">
                Design and reorder routine splits (Push/Pull/Legs).
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE TEMPLATE</span>
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-12 font-mono text-xs text-cyan-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>LOADING TEMPLATES...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-3">
              <p className="text-xs font-mono text-zinc-400">No workout templates created yet.</p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                BUILD FIRST TEMPLATE
              </button>
            </div>
          ) : (
            templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black font-mono text-slate-100">{tpl.name}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(tpl.id)}
                        className="p-1.5 text-zinc-400 hover:text-cyan-400 rounded-lg bg-zinc-950"
                        title="Duplicate Template"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(tpl)}
                        className="p-1.5 text-zinc-400 hover:text-cyan-400 rounded-lg bg-zinc-950"
                        title="Edit Template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tpl.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg bg-zinc-950"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {tpl.description && (
                    <p className="text-xs font-mono text-zinc-400 mb-3">{tpl.description}</p>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">
                      EXERCISES ({tpl.exercises ? tpl.exercises.length : 0})
                    </span>
                    {tpl.exercises && tpl.exercises.length > 0 ? (
                      tpl.exercises.map((item: any, idx: number) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-xs font-mono p-2 rounded-lg bg-zinc-950 text-zinc-300"
                        >
                          <span>{idx + 1}. {item.exercise?.name}</span>
                          <span className="text-[10px] text-zinc-500">{item.targetSets} sets</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs font-mono text-zinc-600">No exercises added.</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h2 className="text-lg font-black font-mono text-slate-100">
                {editingTemplate ? "EDIT TEMPLATE" : "CREATE TEMPLATE"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSaveTemplate} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Push Day"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-zinc-400 uppercase mb-1.5">
                  Description / Focus Area
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Chest, Shoulders & Triceps Hypertrophy"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs font-mono text-slate-100 outline-none"
                />
              </div>

              {/* Selected Exercise Ordering Section */}
              {selectedExerciseIds.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                    SELECTED EXERCISE ORDER ({selectedExerciseIds.length})
                  </span>
                  {selectedExerciseIds.map((exId, idx) => {
                    const ex = availableExercises.find((e) => e.id === exId);
                    return (
                      <div
                        key={exId}
                        className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-slate-200"
                      >
                        <span>{idx + 1}. {ex?.name || "Exercise"}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(idx, "UP")}
                            disabled={idx === 0}
                            className="p-1 text-zinc-400 hover:text-cyan-400 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(idx, "DOWN")}
                            disabled={idx === selectedExerciseIds.length - 1}
                            className="p-1 text-zinc-400 hover:text-cyan-400 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Available Exercise Picker */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                  ADD FROM EXERCISE LIBRARY
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableExercises.map((ex) => {
                    const isSelected = selectedExerciseIds.includes(ex.id);
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => handleToggleExerciseSelection(ex.id)}
                        className={`p-2 rounded-xl border text-left text-xs font-mono flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <span className="truncate">{ex.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-xs font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-zinc-950 font-mono text-xs font-black hover:bg-cyan-400"
                >
                  {editingTemplate ? "UPDATE TEMPLATE" : "SAVE TEMPLATE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
