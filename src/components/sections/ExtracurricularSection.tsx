"use client";

import React from "react";
import { motion } from "framer-motion";
import { extracurricularData } from "@/data/portfolioData";
import { Users, Activity, Shield, Trophy } from "lucide-react";

export const ExtracurricularSection: React.FC = () => {
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
            LEADERSHIP & INNOVATION ACTIVITIES
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            ITeM <span className="text-p5-red">[EXTRACURRICULAR]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          LEADERSHIP // SPORTS // INNOVATION
        </div>
      </div>

      {/* Grid of Extracurricular Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {extracurricularData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-heading tracking-wider text-p5-red mb-2">
                <span className="flex items-center gap-1 uppercase">
                  {idx === 0 ? <Activity className="w-4 h-4 text-p5-red" /> : <Users className="w-4 h-4 text-p5-yellow" />}
                  {item.role}
                </span>
                <span className="text-p5-gray uppercase">ACTIVITY #{idx + 1}</span>
              </div>

              <h3 className="text-2xl font-heading tracking-wider text-white">
                {item.title}
              </h3>

              <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-p5-gray-dark/40 flex items-center justify-between text-xs font-heading tracking-widest text-p5-gray uppercase">
              <span>STATUS: ACTIVE MEMBER</span>
              <span className="text-p5-red font-bold">IIIT SONEPAT</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
