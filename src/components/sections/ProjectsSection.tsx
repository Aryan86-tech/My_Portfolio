"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projectsData, ProjectItem } from "@/data/portfolioData";
import { GithubIcon } from "@/components/SocialIcons";
import { Layers, ShieldCheck, X, Trophy, AlertCircle } from "lucide-react";

export const ProjectsSection: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

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
            HACKATHON PROJECTS & ARSENAL
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            EQUiP <span className="text-p5-red">[PROJECT ARSENAL]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          PROJECTS COUNT: {projectsData.length} HACKATHON BUILDS
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsData.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow flex flex-col justify-between space-y-4 group hover:border-p5-red transition-all"
          >
            <div>
              {/* Event & Category Badge */}
              <div className="flex items-center justify-between text-xs font-heading tracking-wider text-p5-gray mb-2">
                <span className="text-p5-red uppercase flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {project.category}
                </span>
                <span className="bg-p5-red/20 text-p5-yellow border border-p5-yellow/30 px-2 py-0.5 font-bold p5-clip-badge flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-p5-yellow" />
                  {project.event}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-2xl font-heading tracking-wider text-white group-hover:text-p5-red transition-colors">
                {project.title}
              </h3>
              <div className="text-p5-red font-heading text-sm tracking-wider">
                {project.subtitle}
              </div>

              {/* Key Bullet Highlights */}
              <ul className="text-gray-300 text-xs mt-3 space-y-1.5 list-disc list-inside leading-relaxed">
                {project.description.slice(0, 2).map((bullet, bIdx) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 pt-4 border-t border-p5-gray-dark/40">
              {/* Tech Stack Tags */}
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="bg-black text-p5-gray border border-p5-gray-dark/50 px-2 py-0.5 text-[10px] font-heading tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 bg-p5-red text-black font-heading text-base py-2 px-3 text-center tracking-wider hover:bg-red-600 transition-colors p5-clip-button font-bold"
                >
                  VIEW DETAILS
                </button>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-black border border-p5-red/30 text-white hover:text-p5-red hover:border-p5-red transition-colors"
                  title="GitHub Profile"
                >
                  <GithubIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="fixed inset-0 z-[150] bg-black/85 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-p5-surface border-2 border-p5-red p-6 md:p-8 max-w-2xl w-full p5-clip-card shadow-p5-glow space-y-6 relative"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 text-p5-gray hover:text-p5-red p-1"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="border-b border-p5-red/40 pb-3">
                <div className="flex items-center gap-2 text-p5-red font-heading text-xs tracking-widest uppercase">
                  <Trophy className="w-4 h-4 text-p5-yellow" />
                  {selectedProject.event} // {selectedProject.category}
                </div>
                <h2 className="text-3xl md:text-4xl font-heading tracking-wider text-white mt-1">
                  {selectedProject.title}
                </h2>
                <div className="text-p5-yellow font-heading text-lg tracking-wider">
                  {selectedProject.subtitle}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-heading tracking-widest text-p5-red uppercase">SYSTEM ARCHITECTURE & FEATURES:</h4>
                <ul className="space-y-2 text-gray-300 text-sm md:text-base list-disc list-inside leading-relaxed">
                  {selectedProject.description.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-p5-gray-dark/40">
                {selectedProject.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="bg-black text-p5-red border border-p5-red/30 px-3 py-1 text-xs font-heading tracking-wider p5-clip-badge"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-p5-gray-dark/50">
                <div className="flex-1 bg-black/60 border border-p5-gray-dark/50 text-p5-gray font-heading text-base py-3 px-4 text-center tracking-widest p5-clip-button flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-p5-yellow" /> DEMO COMING SOON
                </div>
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-p5-red text-black font-heading text-lg py-3 px-6 text-center tracking-widest hover:bg-red-600 transition-colors p5-clip-button font-bold flex items-center justify-center gap-2"
                >
                  MAIN GITHUB <GithubIcon className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
