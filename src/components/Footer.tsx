"use client";

import React from "react";
import { personalInfo } from "@/data/portfolioData";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-p5-red/30 bg-black/95 px-4 md:px-8 py-3 select-none text-xs font-heading tracking-widest text-p5-gray flex flex-col sm:flex-row items-center justify-between gap-2 z-50 relative">
      <div className="flex items-center gap-4 uppercase">
        <span className="text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-p5-red animate-pulse" />
          SYSTEM: ONLINE
        </span>
        <span>//</span>
        <span className="text-p5-red font-bold">● CLOSE &nbsp;&nbsp; ✕ CONFIRM</span>
      </div>

      <div className="text-center sm:text-right uppercase text-p5-gray/70">
        © {new Date().getFullYear()} {personalInfo.name} — ALL RIGHTS RESERVED
      </div>
    </footer>
  );
};
