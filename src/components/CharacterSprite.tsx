"use client";

import React, { useState, useEffect } from "react";

interface CharacterSpriteProps {
  displaySize?: number;
  className?: string;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  displaySize = 260,
  className = "",
}) => {
  const [frame, setFrame] = useState(0);

  // Cycle through 4 sprite pose states at ~6 FPS
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 160);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative overflow-hidden flex flex-col items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width: displaySize, height: displaySize }}
    >
      {/* Outer Glowing Emblem Ring */}
      <div className="absolute inset-2 border-2 border-p5-red/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
      <div className="absolute inset-6 border border-p5-red/20 rounded-full border-dashed animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />

      {/* Vector Persona Character Silhouette SVG with Frame Movement */}
      <div
        className="relative z-10 transition-transform duration-150 transform"
        style={{
          transform: `translateY(${frame % 2 === 0 ? '-4px' : '0px'}) rotate(${frame === 1 ? '1deg' : frame === 3 ? '-1deg' : '0deg'})`,
        }}
      >
        <svg
          width={displaySize * 0.75}
          height={displaySize * 0.75}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shadow */}
          <ellipse cx="100" cy="180" rx="45" ry="8" fill="#FF0000" opacity="0.3" />

          {/* Persona Mask Outline */}
          <path
            d="M50 80 Q100 40 150 80 Q160 110 140 130 Q100 160 60 130 Q40 110 50 80 Z"
            fill="#0A0A0A"
            stroke="#FF0000"
            strokeWidth="4"
          />

          {/* Eye Cutouts */}
          <path
            d="M65 90 Q80 80 92 92 Q80 98 65 90 Z"
            fill="#FFFFFF"
            stroke="#FF0000"
            strokeWidth="2"
          />
          <path
            d="M135 90 Q120 80 108 92 Q120 98 135 90 Z"
            fill="#FFFFFF"
            stroke="#FF0000"
            strokeWidth="2"
          />

          {/* Crimson Eye Glow */}
          <circle cx="80" cy="89" r="3" fill="#FF0000" />
          <circle cx="120" cy="89" r="3" fill="#FF0000" />

          {/* Coat Collar & Wings */}
          <path
            d="M40 130 L100 175 L160 130 L180 185 L100 200 L20 185 Z"
            fill="#1E1E20"
            stroke="#DC143C"
            strokeWidth="3"
          />

          {/* Flame aura effect */}
          {frame === 0 && (
            <path d="M90 35 Q100 10 110 35 Q105 25 90 35 Z" fill="#FF0000" opacity="0.8" />
          )}
          {frame === 2 && (
            <path d="M85 30 Q100 5 115 30 Q100 20 85 30 Z" fill="#FFD700" opacity="0.8" />
          )}
        </svg>
      </div>

      {/* Status Label */}
      <div className="absolute bottom-2 text-[10px] font-heading tracking-widest text-p5-red/80 uppercase">
        PHANTOM AVATAR v2.6
      </div>
    </div>
  );
};
