"use client";

import React from "react";
import { motion } from "framer-motion";
import { personalInfo, educationData } from "@/data/portfolioData";
import { User, Code, GraduationCap, Flame, Terminal, MapPin, Mail, Download } from "lucide-react";

export const PersonaSection: React.FC = () => {
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
            STUDENT & DEVELOPER PROFILE
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            PeRSoNA <span className="text-p5-red">[{personalInfo.name.toUpperCase()}]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          IIIT SONEPAT // {personalInfo.year} // CGPA: {personalInfo.cgpa}
        </div>
      </div>

      {/* Hero Headline & Supporting Statement */}
      <div className="bg-black/90 border-2 border-p5-red p-6 md:p-8 p5-clip-card shadow-p5-glow space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-p5-red/10 p5-clip-triangle pointer-events-none" />
        <h2 className="text-3xl md:text-5xl font-heading tracking-wider text-white uppercase">
          {personalInfo.headline}
        </h2>
        <p className="text-p5-red font-heading text-lg md:text-xl tracking-wider leading-relaxed">
          &quot;{personalInfo.supportingText}&quot;
        </p>
      </div>

      {/* Grid Layout: Main About Story & Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio Card (2 cols) */}
        <div className="lg:col-span-2 bg-p5-surface border border-p5-red/30 p-6 p5-clip-card relative overflow-hidden shadow-p5-glow space-y-6">
          <div className="flex items-center gap-3 border-b border-p5-gray-dark/50 pb-3">
            <User className="w-6 h-6 text-p5-red" />
            <h3 className="text-2xl font-heading tracking-wider text-white uppercase">
              ABOUT ARYAN
            </h3>
          </div>

          <div className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line space-y-4">
            {personalInfo.about}
          </div>

          {/* Key Traits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-p5-gray-dark/50">
            <div className="bg-black/60 border border-p5-red/20 p-3 p5-clip-badge">
              <div className="flex items-center gap-2 text-p5-red text-xs font-heading tracking-widest">
                <GraduationCap className="w-4 h-4" /> EDUCATION
              </div>
              <div className="text-white font-heading text-lg mt-1">IIIT SONEPAT</div>
            </div>

            <div className="bg-black/60 border border-p5-red/20 p-3 p5-clip-badge">
              <div className="flex items-center gap-2 text-p5-red text-xs font-heading tracking-widest">
                <Code className="w-4 h-4" /> FOCUS
              </div>
              <div className="text-white font-heading text-lg mt-1">SOFTWARE & AI</div>
            </div>

            <div className="bg-black/60 border border-p5-red/20 p-3 p5-clip-badge">
              <div className="flex items-center gap-2 text-p5-red text-xs font-heading tracking-widest">
                <Flame className="w-4 h-4" /> HACKATHONS
              </div>
              <div className="text-white font-heading text-lg mt-1">3 COMPLETED</div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Credentials & Resume Card */}
        <div className="bg-p5-card border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-p5-gray-dark/50 pb-3 mb-4">
              <Terminal className="w-6 h-6 text-p5-red" />
              <h3 className="text-2xl font-heading tracking-wider text-white uppercase">
                ACADEMIC DATA
              </h3>
            </div>

            <div className="space-y-4 text-sm font-heading tracking-wider">
              <div>
                <div className="text-p5-gray text-xs">INSTITUTION</div>
                <div className="text-white text-base leading-snug">{educationData.institution}</div>
              </div>

              <div>
                <div className="text-p5-gray text-xs">DEGREE & YEAR</div>
                <div className="text-p5-red text-lg font-bold">{educationData.degree} ({personalInfo.year})</div>
              </div>

              <div>
                <div className="text-p5-gray text-xs">ACADEMIC CGPA</div>
                <div className="text-p5-yellow text-xl font-bold">{educationData.cgpa}</div>
              </div>

              <div>
                <div className="text-p5-gray text-xs">LOCATION</div>
                <div className="text-white text-base flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-p5-red" />
                  {personalInfo.location}
                </div>
              </div>

              <div>
                <div className="text-p5-gray text-xs">PRIMARY EMAIL</div>
                <div className="text-white text-base flex items-center gap-2 mt-1 truncate">
                  <Mail className="w-4 h-4 text-p5-red" />
                  {personalInfo.email}
                </div>
              </div>
            </div>
          </div>

          <a
            href={personalInfo.resumeUrl}
            download="Aryan_Resume.pdf"
            className="w-full bg-p5-red text-black font-heading text-xl py-3 px-4 text-center tracking-widest hover:bg-red-600 transition-colors p5-clip-button font-bold flex items-center justify-center gap-2 mt-4"
          >
            <Download className="w-5 h-5" /> DOWNLOAD RESUME
          </a>
        </div>
      </div>
    </motion.div>
  );
};
