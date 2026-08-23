"use client";

import React from "react";
import { motion } from "framer-motion";
import { educationData, personalInfo } from "@/data/portfolioData";
import { GraduationCap, Award, Calendar, MapPin, BookOpen, CheckCircle2 } from "lucide-react";

export const EducationSection: React.FC = () => {
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
            ACADEMIC BACKGROUND & DEGREES
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            ACaDeMY <span className="text-p5-red">[EDUCATION]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          CGPA: {educationData.cgpa} // {personalInfo.year}
        </div>
      </div>

      {/* Main Education Card */}
      <div className="bg-p5-surface border-2 border-p5-red p-6 md:p-8 p5-clip-card shadow-p5-glow space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-p5-gray-dark/50 pb-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-8 h-8 text-p5-red shrink-0 mt-1" />
            <div>
              <h2 className="text-3xl md:text-4xl font-heading tracking-wider text-white">
                {educationData.institution}
              </h2>
              <div className="text-p5-red font-heading text-xl tracking-wider mt-1">
                {educationData.degree}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-heading tracking-wider">
            <span className="bg-black/80 text-p5-yellow border border-p5-yellow/30 px-3 py-1 p5-clip-badge flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {educationData.duration}
            </span>
            <span className="bg-black/80 text-p5-red border border-p5-red/30 px-3 py-1 p5-clip-badge flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Sonipat, India
            </span>
          </div>
        </div>

        {/* CGPA Highlight Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/80 border border-p5-red/40 p-4 p5-clip-badge flex items-center gap-4">
            <Award className="w-10 h-10 text-p5-yellow shrink-0" />
            <div>
              <div className="text-p5-gray text-xs font-heading tracking-widest uppercase">CUMULATIVE GPA</div>
              <div className="text-3xl font-heading tracking-wider text-white mt-0.5">
                {educationData.cgpa}
              </div>
            </div>
          </div>

          <div className="bg-black/80 border border-p5-red/40 p-4 p5-clip-badge flex items-center gap-4">
            <BookOpen className="w-10 h-10 text-p5-red shrink-0" />
            <div>
              <div className="text-p5-gray text-xs font-heading tracking-widest uppercase">CURRENT YEAR</div>
              <div className="text-3xl font-heading tracking-wider text-white mt-0.5">
                {personalInfo.year}
              </div>
            </div>
          </div>
        </div>

        {/* Academic Foundations */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xl font-heading tracking-wider text-white uppercase flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-p5-red" />
            CORE COMPUTER SCIENCE FOUNDATIONS
          </h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Strengthening core computer science principles through rigorous coursework in Object-Oriented Programming, Data Structures & Algorithms, Database Management Systems, and File Handling at IIIT Sonepat.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
