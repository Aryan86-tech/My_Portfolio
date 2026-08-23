"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Code, Database, Globe, Lightbulb } from "lucide-react";

export const KnowledgeSection: React.FC = () => {
  const items = [
    {
      title: "REACT PERFORMANCE CHEAT SHEET",
      category: "FRONTEND",
      summary: "Comprehensive checklist for memoization, virtual list rendering, dynamic bundle splitting, and hydration optimization.",
      icon: Code,
    },
    {
      title: "DISTRIBUTED CACHING PATTERNS",
      category: "BACKEND",
      summary: "Patterns for Redis cache-aside, write-through, and cache invalidation strategies in high-concurrency microservices.",
      icon: Database,
    },
    {
      title: "DESIGN SYSTEM TOKEN ARCHITECTURE",
      category: "UI/UX",
      summary: "Structuring semantic CSS variables, clip-path polygons, contrast-accessible color palettes, and responsive font scaling.",
      icon: Lightbulb,
    },
    {
      title: "ACCESSIBLE KEYBOARD NAVIGATION",
      category: "ACCESSIBILITY",
      summary: "Enforcing focus rings, aria-labels, screen reader cues, and trap-free keyboard focus management.",
      icon: Globe,
    },
  ];

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
            RESEARCH & EXPERIMENTS
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            ITeM <span className="text-p5-red">[KNOWLEDGE BASE]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          ITEMS RECORDED: {items.length} GUIDES
        </div>
      </div>

      {/* Grid of Knowledge Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => {
          const IconComp = item.icon;
          return (
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
                    <BookOpen className="w-3.5 h-3.5" />
                    {item.category}
                  </span>
                  <span className="text-p5-gray">ITEM #{idx + 1}</span>
                </div>

                <h3 className="text-2xl font-heading tracking-wider text-white flex items-center gap-2">
                  <IconComp className="w-5 h-5 text-p5-red shrink-0" />
                  {item.title}
                </h3>

                <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-p5-gray-dark/40">
                <span className="text-p5-gray text-xs font-heading tracking-widest uppercase block">
                  STATUS: ARCHIVED & AVAILABLE
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
