"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navigationItems } from "@/data/portfolioData";
import { CharacterSprite } from "@/components/CharacterSprite";

interface NavigationWheelProps {
  activeRoute: string;
  onSelectRoute: (id: string) => void;
}

export const NavigationWheel: React.FC<NavigationWheelProps> = ({
  activeRoute,
  onSelectRoute,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="relative w-full min-h-[calc(100vh-140px)] flex flex-col justify-between py-6 select-none overflow-hidden">
      {/* Background Graphic Layer: Angled Red/Dark Gradient Slice on Left */}
      <div className="absolute left-0 top-0 bottom-0 w-full md:w-1/3 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 p5-red-stripes"
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-32 bg-black hidden md:block"
          style={{ clipPath: "polygon(100% 0%, 100% 100%, 0% 100%)" }}
        />
      </div>

      {/* Background Graphic Layer: Halftone Dot Matrix / Diagonal Line Texture on Right */}
      <div className="absolute right-0 top-0 bottom-0 w-1/4 overflow-hidden opacity-20 pointer-events-none -z-10 hidden lg:block">
        <motion.div
          animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 p5-stripe-bg"
        />
      </div>

      {/* Center/Right Layer: Character Sprite & Watermark Emblem */}
      <div className="absolute right-[8%] lg:right-[15%] top-1/2 -translate-y-1/2 hidden md:block pointer-events-none -z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <CharacterSprite displaySize={320} />
        </motion.div>
      </div>

      {/* Main Command List Container */}
      <div className="relative z-20 left-0 md:left-[8%] lg:left-[12%] flex flex-col gap-1 md:gap-2 my-auto max-w-xl">
        {navigationItems.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          const isActive = activeRoute === item.id;

          return (
            <motion.button
              key={item.id}
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.05 * idx, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx(null)}
              onClick={() => onSelectRoute(item.id)}
              className="relative group text-left px-4 md:px-6 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-p5-red"
              aria-label={`Command ${idx + 1}: ${item.label} - ${item.desc}`}
            >
              {/* Expanding Red Background Banner on Hover */}
              <motion.div
                className="absolute inset-0 bg-p5-red -z-10 p5-clip-button"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isHovered || isActive ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ transformOrigin: "left" }}
              />

              {/* Tag Label above Command */}
              <span className="block text-[10px] md:text-xs font-heading tracking-widest text-p5-gray group-hover:text-black uppercase">
                [{idx + 1}] // {item.tag}
              </span>

              {/* Command Title Text */}
              <span
                className={`block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading tracking-wider transition-all duration-200 ${
                  isHovered || isActive
                    ? "text-white translate-x-2 -skew-x-2 p5-text-shadow font-bold"
                    : "text-white/90"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Dashboard Bar: Active Command & Description Info */}
      <div className="relative z-20 mt-8 left-0 md:left-[8%] lg:left-[12%] right-[4%] md:right-[8%] flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-t border-p5-gray-dark/40 pt-4">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-p5-gray text-xs md:text-sm font-heading tracking-[0.2em] uppercase"
          >
            SELECT A COMMAND TO EXECUTE [KEYS 1-8 OR MOUSE]
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl md:text-7xl font-heading tracking-wider text-white/15 leading-none uppercase"
          >
            CoMMaND
          </motion.h2>
        </div>

        {/* Dynamic Description Box on Hover/Active */}
        <div className="text-left md:text-right">
          <AnimatePresence mode="wait">
            {hoveredIdx !== null ? (
              <motion.div
                key={`desc-${hoveredIdx}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-black/90 border border-p5-red/50 p-3 p5-clip-badge shadow-p5-glow inline-block"
              >
                <div className="text-p5-red text-sm md:text-base font-heading tracking-wider font-bold">
                  ► {navigationItems[hoveredIdx].desc}
                </div>
                <div className="text-p5-gray text-[10px] font-heading tracking-widest uppercase mt-0.5">
                  STATUS: READY TO ENTER
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="desc-default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-p5-gray/60 text-xs font-heading tracking-wider"
              >
                ● PRESS 1-8 OR CLICK COMMAND TO PROCEED
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
