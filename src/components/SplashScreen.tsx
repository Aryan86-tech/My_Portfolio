"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<"frames" | "logo" | "done">("frames");
  const [frameIndex, setFrameIndex] = useState(0);

  // 6 frame loading sequence simulated with high-contrast graphic frames
  const totalFrames = 6;

  useEffect(() => {
    if (step === "frames") {
      if (frameIndex < totalFrames - 1) {
        const timer = setTimeout(() => {
          setFrameIndex((prev) => prev + 1);
        }, 180);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setStep("logo");
        }, 180);
        return () => clearTimeout(timer);
      }
    }
  }, [frameIndex, step]);

  useEffect(() => {
    if (step === "logo") {
      const timer = setTimeout(() => {
        setStep("done");
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === "done") {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  const handleSkip = useCallback(() => {
    setStep("done");
    onComplete();
  }, [onComplete]);

  return (
    <AnimatePresence>
      {step !== "done" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleSkip}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-pointer overflow-hidden select-none"
        >
          {/* Background diagonal movement */}
          <div className="absolute inset-0 p5-stripe-bg opacity-20 pointer-events-none" />

          {/* Frame Sequence Phase */}
          {step === "frames" && (
            <motion.div
              key={`frame-${frameIndex}`}
              initial={{ scale: 1.05, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="relative w-80 h-80 flex flex-col items-center justify-center border-4 border-p5-red bg-black/90 p5-clip-card shadow-p5-glow"
            >
              <div className="text-p5-red font-heading text-9xl tracking-tighter leading-none select-none">
                0{frameIndex + 1}
              </div>
              <div className="text-white font-heading text-xl tracking-[0.3em] mt-2 uppercase">
                LOADING PALACE...
              </div>
              {/* Progress Bar */}
              <div className="w-48 h-2 bg-p5-gray-dark mt-6 overflow-hidden border border-p5-red/40">
                <div
                  className="h-full bg-p5-red transition-all duration-150"
                  style={{ width: `${((frameIndex + 1) / totalFrames) * 100}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Logo Reveal Phase */}
          {step === "logo" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[90vw] max-w-lg flex flex-col items-center text-center"
            >
              {/* Stylized Emblem Header */}
              <div className="bg-p5-red text-black font-heading text-5xl md:text-7xl px-8 py-2 tracking-widest p5-clip-button transform -skew-x-6 shadow-p5-glow mb-4">
                TAKE YOUR HEART
              </div>
              <p className="text-p5-gray text-sm md:text-base font-heading tracking-[0.3em] uppercase mt-2">
                PORTFOLIO SYSTEM INITIALIZED
              </p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-p5-red font-heading text-lg tracking-[0.2em] mt-6 animate-pulse"
              >
                [ CLICK ANYWHERE TO CONTINUE ]
              </motion.p>
            </motion.div>
          )}

          {/* Skip Notice */}
          <div className="absolute bottom-6 right-8 text-p5-gray/50 text-xs font-heading tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-p5-red animate-ping" />
            CLICK TO SKIP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
