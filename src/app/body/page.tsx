"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PlayerHeader } from "@/components/layout/PlayerHeader";
import {
  Scale,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Target,
  Ruler,
  Calendar,
  Sparkles,
  Info,
  Edit2,
  X,
} from "lucide-react";

export default function BodyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Weight State
  const [weightData, setWeightData] = useState<any>(null);
  const [filterRange, setFilterRange] = useState<"7D" | "30D" | "90D" | "ALL">("30D");

  // Body Measurements State
  const [measurementsData, setMeasurementsData] = useState<any>(null);

  // Modals
  const [showLogWeightModal, setShowLogWeightModal] = useState(false);
  const [showLogMeasurementModal, setShowLogMeasurementModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Form Inputs
  const [inputWeight, setInputWeight] = useState("");
  const [inputDate, setInputDate] = useState(new Date().toISOString().split("T")[0]);
  const [inputNotes, setInputNotes] = useState("");
  const [inputUnit, setInputUnit] = useState<"kg" | "lb">("kg");

  // Target Form
  const [targetVal, setTargetVal] = useState("");
  const [startVal, setStartVal] = useState("");

  // Measurement Inputs
  const [mWaist, setMWaist] = useState("");
  const [mChest, setMChest] = useState("");
  const [mArms, setMArms] = useState("");
  const [mThighs, setMThighs] = useState("");
  const [mHip, setMHip] = useState("");
  const [mNeck, setMNeck] = useState("");
  const [mBodyFat, setMBodyFat] = useState("");

  useEffect(() => {
    fetchBodyPageData();
  }, []);

  const fetchBodyPageData = async () => {
    try {
      const [uRes, wRes, mRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/body/weight"),
        fetch("/api/body/measurements"),
      ]);

      if (uRes.ok) {
        const u = await uRes.json();
        setUserData(u);
      }

      if (wRes.ok) {
        const w = await wRes.json();
        setWeightData(w);
        setInputUnit(w.unit || "kg");
        setTargetVal(w.targetWeight ? String(w.targetWeight) : "");
        setStartVal(w.startingWeight ? String(w.startingWeight) : "");
      }

      if (mRes.ok) {
        const m = await mRes.json();
        setMeasurementsData(m);
      }
    } catch (err) {
      console.error("Body page data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWeight || Number(inputWeight) <= 0) return;

    try {
      const res = await fetch("/api/body/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: Number(inputWeight),
          date: inputDate,
          notes: inputNotes,
          unit: inputUnit,
        }),
      });

      if (res.ok) {
        setShowLogWeightModal(false);
        setInputWeight("");
        setInputNotes("");
        fetchBodyPageData();
      }
    } catch (err) {
      console.error("Failed to save weight:", err);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    try {
      const res = await fetch(`/api/body/weight?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBodyPageData();
      }
    } catch (err) {
      console.error("Delete weight error:", err);
    }
  };

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/body/weight", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetWeight: targetVal ? Number(targetVal) : null,
          startingWeight: startVal ? Number(startVal) : null,
          unitPreference: inputUnit,
        }),
      });

      if (res.ok) {
        setShowTargetModal(false);
        fetchBodyPageData();
      }
    } catch (err) {
      console.error("Update target error:", err);
    }
  };

  const handleSaveMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/body/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: inputDate,
          waist: mWaist ? Number(mWaist) : null,
          chest: mChest ? Number(mChest) : null,
          arms: mArms ? Number(mArms) : null,
          thighs: mThighs ? Number(mThighs) : null,
          hip: mHip ? Number(mHip) : null,
          neck: mNeck ? Number(mNeck) : null,
          bodyFat: mBodyFat ? Number(mBodyFat) : null,
          unit: "in",
        }),
      });

      if (res.ok) {
        setShowLogMeasurementModal(false);
        setMWaist("");
        setMChest("");
        setMArms("");
        setMThighs("");
        setMHip("");
        setMNeck("");
        setMBodyFat("");
        fetchBodyPageData();
      }
    } catch (err) {
      console.error("Save measurements error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-cyan-400 flex flex-col items-center justify-center font-mono">
        <Sparkles className="w-8 h-8 animate-spin mb-3" />
        <span className="text-xs uppercase tracking-widest">LOADING BODY METRICS...</span>
      </div>
    );
  }

  const profile = userData?.profile || {};
  const username = userData?.user?.username || "Warrior";
  const activeArc = userData?.activeWinterArc;

  const currentWeight = weightData?.currentWeight || 84.2;
  const targetWeight = weightData?.targetWeight || 75.0;
  const startingWeight = weightData?.startingWeight || 88.0;
  const unit = weightData?.unit || "kg";
  const remaining = weightData?.remaining ?? Math.max(0, currentWeight - targetWeight);
  const totalChange = weightData?.totalChange ?? Math.round((currentWeight - startingWeight) * 10) / 10;
  const progressPercent = weightData?.progressPercent || 25;
  const history: any[] = weightData?.history || [];

  // Filter history by date range
  const filteredHistory = history.filter((item) => {
    if (filterRange === "ALL") return true;
    const days = filterRange === "7D" ? 7 : filterRange === "30D" ? 30 : 90;
    const diff = (new Date().getTime() - new Date(item.date).getTime()) / (1000 * 3600 * 24);
    return diff <= days;
  });

  const latestM = measurementsData?.latestSummary || {};

  return (
    <AppShell>
      {/* 1. LOG WEIGHT MODAL */}
      {showLogWeightModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl font-mono relative">
            <button
              onClick={() => setShowLogWeightModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-cyan-400" />
              <span>LOG BODY WEIGHT</span>
            </h3>

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                  Weight ({unit.toUpperCase()}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 84.2"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                    Unit Preference
                  </label>
                  <select
                    value={inputUnit}
                    onChange={(e) => setInputUnit(e.target.value as "kg" | "lb")}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="lb">Pounds (lb)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                  Optional Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning weigh-in, post workout"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                SAVE WEIGH-IN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. TARGET WEIGHT MODAL */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl font-mono relative">
            <button
              onClick={() => setShowTargetModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>CONFIGURE WEIGHT GOALS</span>
            </h3>

            <form onSubmit={handleSaveTarget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                  Starting Weight ({unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 88.0"
                  value={startVal}
                  onChange={(e) => setStartVal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                  Target Weight ({unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 75.0"
                  value={targetVal}
                  onChange={(e) => setTargetVal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                UPDATE TARGETS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. LOG MEASUREMENT MODAL */}
      {showLogMeasurementModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl font-mono relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowLogMeasurementModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-2 mb-4">
              <Ruler className="w-5 h-5 text-teal-400" />
              <span>LOG BODY MEASUREMENTS (INCHES)</span>
            </h3>

            <form onSubmit={handleSaveMeasurements} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Waist (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 34.5"
                    value={mWaist}
                    onChange={(e) => setMWaist(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Chest (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 40.0"
                    value={mChest}
                    onChange={(e) => setMChest(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Arms (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.2"
                    value={mArms}
                    onChange={(e) => setMArms(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Thighs (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 23.5"
                    value={mThighs}
                    onChange={(e) => setMThighs(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Hips (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 38.0"
                    value={mHip}
                    onChange={(e) => setMHip(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Neck (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.5"
                    value={mNeck}
                    onChange={(e) => setMNeck(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Body Fat % (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 18.5"
                  value={mBodyFat}
                  onChange={(e) => setMBodyFat(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                SAVE MEASUREMENTS
              </button>
            </form>
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

        {/* TOP BAR / QUICK ACTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-xl font-black font-mono tracking-tight text-slate-100 flex items-center gap-2">
              <Scale className="w-6 h-6 text-cyan-400" />
              <span>BODY COMPOSITION & WEIGHT</span>
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Track weight trends, body measurements, and Winter Arc milestones.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowTargetModal(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all border border-zinc-700"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Targets</span>
            </button>
            <button
              onClick={() => setShowLogWeightModal(true)}
              className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-mono font-black px-4 py-2 rounded-xl text-xs shadow-lg flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ LOG WEIGHT</span>
            </button>
          </div>
        </div>

        {/* 1. CURRENT WEIGHT & PROGRESS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          {/* Current Weight Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                CURRENT WEIGHT
              </span>
              <div className="text-4xl font-black text-slate-100 mt-1">
                {currentWeight} <span className="text-sm font-normal text-zinc-400">{unit}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between items-center text-xs">
              <span className="text-zinc-400">Total Change</span>
              <span className={`font-bold flex items-center gap-1 ${totalChange <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {totalChange <= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {totalChange > 0 ? `+${totalChange}` : totalChange} {unit}
              </span>
            </div>
          </div>

          {/* Target Weight & Remaining Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                TARGET WEIGHT
              </span>
              <div className="text-4xl font-black text-cyan-400 mt-1">
                {targetWeight} <span className="text-sm font-normal text-zinc-400">{unit}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between items-center text-xs">
              <span className="text-zinc-400">Remaining</span>
              <span className="font-bold text-cyan-300">
                {remaining} {unit}
              </span>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                WINTER ARC WEIGHT PROGRESS
              </span>
              <div className="text-4xl font-black text-teal-400 mt-1">
                {progressPercent}%
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="w-full bg-zinc-950 h-2.5 rounded-full border border-zinc-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 text-right">
                {startingWeight} {unit} → {targetWeight} {unit}
              </p>
            </div>
          </div>
        </div>

        {/* 2. WEIGHT TREND CHART & FILTERS */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 font-mono">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-100 tracking-tight">
                WEIGHT TREND
              </h3>
              <p className="text-xs text-zinc-400">Actual weigh-ins recorded over time.</p>
            </div>

            <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {(["7D", "30D", "90D", "ALL"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterRange === r
                      ? "bg-cyan-500 text-zinc-950"
                      : "text-zinc-400 hover:text-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Visual Line Chart */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs uppercase tracking-widest border border-dashed border-zinc-800 rounded-xl">
              Add more weigh-ins to see your trend.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-48 w-full flex items-end justify-between gap-2 pt-6 px-2 border-b border-zinc-800 pb-2">
                {filteredHistory.slice(0, 14).reverse().map((item, idx) => {
                  const minW = Math.min(...filteredHistory.map((h) => h.weight)) - 2;
                  const maxW = Math.max(...filteredHistory.map((h) => h.weight)) + 2;
                  const range = Math.max(1, maxW - minW);
                  const heightPct = Math.max(15, Math.round(((item.weight - minW) / range) * 100));

                  return (
                    <div key={item.id || idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.weight}
                      </span>
                      <div
                        className="w-full max-w-[24px] bg-gradient-to-t from-cyan-600 to-teal-400 rounded-t-lg transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] text-zinc-500 uppercase tracking-tighter truncate w-full text-center">
                        {item.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. WEIGHT HISTORY LOG */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 font-mono">
          <h3 className="text-base font-black text-slate-100 tracking-tight">
            WEIGHT HISTORY LOG
          </h3>

          {history.length === 0 ? (
            <p className="text-xs text-zinc-500">No weigh-ins recorded yet.</p>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {history.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200">{item.weight} {item.unit || unit}</span>
                    <span className="text-zinc-500 ml-3">{item.date}</span>
                    {item.notes && <p className="text-[11px] text-zinc-400 mt-0.5">{item.notes}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteWeight(item.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. BODY MEASUREMENTS DASHBOARD */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 font-mono">
          <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
                <Ruler className="w-5 h-5 text-teal-400" />
                <span>BODY MEASUREMENTS</span>
              </h3>
              <p className="text-xs text-zinc-400">Track inches and body composition.</p>
            </div>
            <button
              onClick={() => setShowLogMeasurementModal(true)}
              className="bg-teal-950 border border-teal-500/40 text-teal-400 hover:bg-teal-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Measurements</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "WAIST", val: latestM.waist },
              { label: "CHEST", val: latestM.chest },
              { label: "ARMS", val: latestM.arms },
              { label: "THIGHS", val: latestM.thighs },
              { label: "HIPS", val: latestM.hip },
              { label: "NECK", val: latestM.neck },
              { label: "BODY FAT", val: latestM.bodyFat, isPct: true },
            ].map((m) => (
              <div key={m.label} className="bg-zinc-950 border border-zinc-800/80 p-3 rounded-xl text-center">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{m.label}</span>
                <div className="text-base font-black text-slate-100 mt-1">
                  {m.val ? `${m.val}${m.isPct ? "%" : " in"}` : "--"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
