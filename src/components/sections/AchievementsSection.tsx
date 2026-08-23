"use client";

import React from "react";
import { motion } from "framer-motion";
import { achievementsData } from "@/data/portfolioData";
import { Award, Trophy, ShieldCheck, Flame, CheckCircle2 } from "lucide-react";

export const AchievementsSection: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header Banner */}
      <div className="relative border-b-2 border-p5-red pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-block bg-p5-red text-black font-heading text-xs px-3 py-1 tracking-widest uppercase p5-clip-badge mb-2 font-bold">
            HONORS & HACKATHON PARTICIPATION
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            STaTS <span className="text-p5-red">[ACHIEVEMENTS]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          3 HACKATHONS // ACADEMIC EXCELLENCE
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievementsData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={`bg-p5-surface border p-6 p5-clip-card shadow-p5-glow flex flex-col justify-between space-y-4 ${
              item.certId ? "border-p5-red border-2 bg-black/90" : "border-p5-red/30"
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs font-heading tracking-wider text-p5-red mb-2">
                <span className="flex items-center gap-1 uppercase">
                  {item.certId ? <Award className="w-4 h-4 text-p5-yellow" /> : <Flame className="w-4 h-4 text-p5-red" />}
                  {item.category}
                </span>
                {item.certId && (
                  <span className="bg-p5-red text-black px-2 py-0.5 font-bold p5-clip-badge">
                    CERTIFIED
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-heading tracking-wider text-white">
                {item.title}
              </h3>

              <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                {item.details}
              </p>
            </div>

            {item.certId && (
              <div className="pt-3 border-t border-p5-gray-dark/40 bg-black/60 p-3 p5-clip-badge flex items-center justify-between">
                <span className="text-p5-gray text-xs font-heading tracking-widest">CERTIFICATE ID:</span>
                <span className="text-p5-yellow font-heading text-sm tracking-wider font-bold">{item.certId}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
