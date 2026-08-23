"use client";

import React from "react";
import { motion } from "framer-motion";
import { statsData, personalInfo, educationData } from "@/data/portfolioData";
import { Award, Flame, FolderGit2, GraduationCap, Code2, ShieldCheck } from "lucide-react";
import { GithubIcon } from "@/components/SocialIcons";

export const StatsSection: React.FC = () => {
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
            ACADEMIC METRICS & RECORDED DATA
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            STaTS <span className="text-p5-red">[ARYAN METRICS]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          IIIT SONEPAT // {personalInfo.year}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow flex items-center gap-4">
          <div className="p-4 bg-p5-red/10 border border-p5-red p5-clip-button text-p5-red">
            <Award className="w-8 h-8 text-p5-yellow" />
          </div>
          <div>
            <div className="text-p5-gray text-xs font-heading tracking-widest">CUMULATIVE CGPA</div>
            <div className="text-3xl md:text-4xl font-heading tracking-wider text-white mt-1">
              {statsData.cgpa}
            </div>
          </div>
        </div>

        <div className="bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow flex items-center gap-4">
          <div className="p-4 bg-p5-red/10 border border-p5-red p5-clip-button text-p5-red">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <div className="text-p5-gray text-xs font-heading tracking-widest">HACKATHONS ATTENDED</div>
            <div className="text-3xl md:text-4xl font-heading tracking-wider text-white mt-1">
              {statsData.hackathonsCount} HACKATHONS
            </div>
          </div>
        </div>

        <div className="bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow flex items-center gap-4">
          <div className="p-4 bg-p5-red/10 border border-p5-red p5-clip-button text-p5-red">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <div>
            <div className="text-p5-gray text-xs font-heading tracking-widest">PROJECTS DELIVERED</div>
            <div className="text-3xl md:text-4xl font-heading tracking-wider text-white mt-1">
              {statsData.projectsCount} BUILDS
            </div>
          </div>
        </div>

        <div className="bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow flex items-center gap-4">
          <div className="p-4 bg-p5-red/10 border border-p5-red p5-clip-button text-p5-red">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="text-p5-gray text-xs font-heading tracking-widest">COLLEGE YEAR</div>
            <div className="text-3xl md:text-4xl font-heading tracking-wider text-white mt-1">
              {statsData.collegeYear}
            </div>
          </div>
        </div>

        <div className="bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow flex items-center gap-4">
          <div className="p-4 bg-p5-red/10 border border-p5-red p5-clip-button text-p5-red">
            <Code2 className="w-8 h-8" />
          </div>
          <div>
            <div className="text-p5-gray text-xs font-heading tracking-widest">DEGREE PROGRAM</div>
            <div className="text-2xl font-heading tracking-wider text-p5-yellow mt-1">
              B.TECH CSE
            </div>
          </div>
        </div>

        <div className="bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow flex items-center gap-4">
          <div className="p-4 bg-p5-red/10 border border-p5-red p5-clip-button text-p5-red">
            <GithubIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="text-p5-gray text-xs font-heading tracking-widest">GITHUB PROFILE</div>
            <div className="text-2xl font-heading tracking-wider text-white mt-1">
              {statsData.githubProfile}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
