"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionWipeProps {
  isWiping: boolean;
  onWipeEnd?: () => void;
}

export const PageTransitionWipe: React.FC<PageTransitionWipeProps> = ({
  isWiping,
  onWipeEnd,
}) => {
  return (
    <AnimatePresence>
      {isWiping && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={onWipeEnd}
          style={{ transformOrigin: "left" }}
          className="fixed inset-0 bg-p5-red z-[300] flex items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-black font-heading text-6xl md:text-8xl tracking-widest p5-clip-button px-8 py-2 bg-white transform -skew-x-12 shadow-2xl font-bold"
          >
            CHANGING TARGET...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
