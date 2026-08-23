"use client";

import React from "react";
import { motion } from "framer-motion";
import { skillCategories } from "@/data/portfolioData";
import { RadarChart } from "@/components/RadarChart";
import { Cpu, Zap } from "lucide-react";

export const SkillsSection: React.FC = () => {
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
            TECHNICAL MATRIX & COMPETENCIES
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            SKiLL <span className="text-p5-red">[ABILITIES & TOOLS]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          CS CORE // FULL STACK // AI & TOOLS
        </div>
      </div>

      {/* Main Grid: Radar Star Chart & Skill Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Star Chart (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <RadarChart size={340} />
        </div>

        {/* Right Column: Skill Categories Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {skillCategories.map((cat, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: catIdx * 0.1 }}
              className="bg-p5-surface border border-p5-red/30 p-5 p5-clip-card shadow-p5-glow space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-p5-gray-dark/50 pb-2">
                <Cpu className="w-5 h-5 text-p5-red" />
                <h3 className="text-xl font-heading tracking-wider text-white uppercase">
                  {cat.category}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {cat.skills.map((skill, skillIdx) => (
                  <span
                    key={skillIdx}
                    className="bg-black/90 text-white border border-p5-red/30 px-3.5 py-1.5 text-xs font-heading tracking-wider p5-clip-badge flex items-center gap-1.5 hover:border-p5-red transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-p5-yellow" />
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
