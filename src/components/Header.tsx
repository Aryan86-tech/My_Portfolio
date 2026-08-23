"use client";

import React, { useState } from "react";
import { personalInfo } from "@/data/portfolioData";
import { Volume2, VolumeX, Menu, Home } from "lucide-react";

interface HeaderProps {
  activeRoute: string | null;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeRoute, onGoHome }) => {
  const [muted, setMuted] = useState(false);

  return (
    <header className="sticky top-0 z-[100] bg-black/90 backdrop-blur-md border-b border-p5-red/30 px-4 md:px-8 py-3 flex items-center justify-between select-none">
      {/* Brand Logo Badge */}
      <button
        onClick={onGoHome}
        className="flex items-center gap-3 group text-left outline-none focus:ring-2 focus:ring-p5-red"
        aria-label="Return to Command Hub"
      >
        <div className="bg-p5-red text-black font-heading text-xl md:text-2xl px-3 py-1 tracking-widest transform -skew-x-6 group-hover:bg-white transition-colors p5-clip-button font-bold">
          {personalInfo.alias}
        </div>
        <div className="hidden sm:block">
          <div className="text-white font-heading text-base tracking-wider leading-none uppercase group-hover:text-p5-red transition-colors">
            {personalInfo.name}
          </div>
          <div className="text-p5-gray text-[10px] font-heading tracking-widest uppercase">
            PORTFOLIO PALACE SYSTEM
          </div>
        </div>
      </button>

      {/* Center Route Status Indicator */}
      {activeRoute && (
        <div className="hidden md:flex items-center gap-2 bg-p5-surface border border-p5-red/40 px-4 py-1.5 p5-clip-badge">
          <span className="w-2 h-2 rounded-full bg-p5-red animate-ping" />
          <span className="text-p5-red font-heading text-sm tracking-widest uppercase font-bold">
            LOCATION: /{activeRoute}
          </span>
        </div>
      )}

      {/* Right Utility Buttons */}
      <div className="flex items-center gap-3">
        {activeRoute && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 bg-p5-red text-black font-heading text-sm md:text-base px-3 py-1.5 tracking-wider hover:bg-white transition-colors p5-clip-button font-bold"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">COMMAND HUB</span>
          </button>
        )}

        <button
          onClick={() => setMuted(!muted)}
          className="p-2 bg-p5-surface border border-p5-red/30 text-white hover:text-p5-red hover:border-p5-red transition-colors"
          title={muted ? "Unmute Sound" : "Mute Sound"}
          aria-label={muted ? "Unmute Sound Effects" : "Mute Sound Effects"}
        >
          {muted ? <VolumeX className="w-5 h-5 text-p5-gray" /> : <Volume2 className="w-5 h-5 text-p5-red" />}
        </button>
      </div>
    </header>
  );
};
