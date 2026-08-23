"use client";

import React from "react";
import { motion } from "framer-motion";
import { experienceData } from "@/data/portfolioData";
import { Award, Briefcase, Calendar, MapPin } from "lucide-react";

export const ExperienceSection: React.FC = () => {
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
            CONFIDANT COOPERATION & RANKS
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            CoNFiDaNT <span className="text-p5-red">[EXPERIENCE]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          RANK MAX: ACTIVE ROLES
        </div>
      </div>

      {/* Confidant Rank Timeline List */}
      <div className="relative border-l-2 border-p5-red/40 ml-4 md:ml-8 pl-6 md:pl-10 space-y-8">
        {experienceData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.15 }}
            className="relative bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow space-y-4"
          >
            {/* Rank Badge on Timeline Node */}
            <div className="absolute -left-[45px] md:-left-[61px] top-6 bg-p5-red text-black font-heading text-lg md:text-xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-black font-bold shadow-p5-glow">
              R{item.rank}
            </div>

            {/* Role Header & Metadata */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-p5-gray-dark/50 pb-3">
              <div>
                <h3 className="text-2xl md:text-3xl font-heading tracking-wider text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-p5-red" />
                  {item.role}
                </h3>
                <div className="text-p5-red font-heading text-lg tracking-wider">
                  @ {item.company}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-heading tracking-wider text-p5-gray">
                <span className="flex items-center gap-1 bg-black/60 px-3 py-1 border border-p5-gray-dark/40">
                  <Calendar className="w-3.5 h-3.5 text-p5-yellow" />
                  {item.period}
                </span>
                <span className="flex items-center gap-1 bg-black/60 px-3 py-1 border border-p5-gray-dark/40">
                  <MapPin className="w-3.5 h-3.5 text-p5-red" />
                  {item.location}
                </span>
              </div>
            </div>

            {/* Bullet Points */}
            <ul className="space-y-2 text-gray-300 text-sm md:text-base list-disc list-inside">
              {item.description.map((desc, descIdx) => (
                <li key={descIdx} className="leading-relaxed">
                  {desc}
                </li>
              ))}
            </ul>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-p5-gray-dark/40">
              {item.technologies.map((tech, techIdx) => (
                <span
                  key={techIdx}
                  className="bg-black/80 text-p5-red border border-p5-red/30 px-3 py-0.5 text-xs font-heading tracking-wider p5-clip-badge"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
