"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { personalInfo } from "@/data/portfolioData";
import { GithubIcon, LinkedinIcon } from "@/components/SocialIcons";
import { Mail, Send, CheckCircle2, Download, MapPin } from "lucide-react";

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: "", email: "", message: "" });
        setSubmitted(false);
      }, 5000);
    }
  };

  return (
    <motion.div
      id="contact"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header Banner */}
      <div className="relative border-b-2 border-p5-red pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-block bg-p5-red text-black font-heading text-xs px-3 py-1 tracking-widest uppercase p5-clip-badge mb-2 font-bold">
            DIRECT CHANNEL & CONNECT WITH ARYAN
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider text-white">
            GUaRD <span className="text-p5-red">[CONTACT & RESUME]</span>
          </h1>
        </div>
        <div className="text-p5-gray text-xs md:text-sm font-heading tracking-widest uppercase">
          RESPONSE TIME: WITHIN 24 HOURS // SONIPAT, INDIA
        </div>
      </div>

      {/* Grid: Transmission Form & Social Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-p5-surface border border-p5-red/30 p-6 md:p-8 p5-clip-card shadow-p5-glow space-y-6">
          <div className="border-b border-p5-gray-dark/50 pb-3">
            <h2 className="text-2xl md:text-3xl font-heading tracking-wider text-white uppercase">
              SEND A DIRECT TRANSMISSION
            </h2>
            <p className="text-gray-300 text-xs md:text-sm mt-1">
              Have a project inquiry, hackathon collaboration, or software development opportunity? Send Aryan a message below.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black/80 border-2 border-p5-red p-6 text-center p5-clip-badge space-y-3"
            >
              <CheckCircle2 className="w-12 h-12 text-p5-red mx-auto" />
              <h3 className="text-2xl font-heading tracking-wider text-white">
                TRANSMISSION RECEIVED!
              </h3>
              <p className="text-p5-gray text-sm font-heading tracking-wider">
                Thank you for reaching out. I will respond to your message shortly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-heading tracking-wider">
              <div>
                <label className="block text-p5-gray text-xs mb-1 uppercase">YOUR NAME *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full bg-black/80 border border-p5-red/40 px-4 py-3 text-white text-sm focus:outline-none focus:border-p5-red font-body transition-colors"
                />
              </div>

              <div>
                <label className="block text-p5-gray text-xs mb-1 uppercase">YOUR EMAIL ADDRESS *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-black/80 border border-p5-red/40 px-4 py-3 text-white text-sm focus:outline-none focus:border-p5-red font-body transition-colors"
                />
              </div>

              <div>
                <label className="block text-p5-gray text-xs mb-1 uppercase">TRANSMISSION MESSAGE *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell me about your project, hackathon, or opportunity..."
                  className="w-full bg-black/80 border border-p5-red/40 px-4 py-3 text-white text-sm focus:outline-none focus:border-p5-red font-body transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-p5-red text-black font-heading text-xl py-3 px-6 text-center tracking-widest hover:bg-red-600 transition-colors p5-clip-button font-bold flex items-center justify-center gap-2"
              >
                SEND TRANSMISSION <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Social Channels & Direct Email (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-p5-surface border border-p5-red/30 p-6 p5-clip-card shadow-p5-glow space-y-4">
            <h3 className="text-xl font-heading tracking-wider text-white uppercase border-b border-p5-gray-dark/50 pb-2">
              PRIMARY CONTACT CHANNELS
            </h3>

            <div className="space-y-3 font-heading tracking-wider">
              <a
                href={`mailto:${personalInfo.email}`}
                className="flex items-center gap-3 p-3 bg-black/80 border border-p5-red/20 text-white hover:border-p5-red hover:text-p5-red transition-all p5-clip-badge group"
              >
                <Mail className="w-5 h-5 text-p5-red shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs text-p5-gray">EMAIL ADDRESS</div>
                  <div className="text-base truncate">{personalInfo.email}</div>
                </div>
              </a>

              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-black/80 border border-p5-red/20 text-white hover:border-p5-red hover:text-p5-red transition-all p5-clip-badge group"
              >
                <GithubIcon className="w-5 h-5 text-p5-red shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs text-p5-gray">GITHUB PROFILE</div>
                  <div className="text-base truncate">{personalInfo.github}</div>
                </div>
              </a>

              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-black/80 border border-p5-red/20 text-white hover:border-p5-red hover:text-p5-red transition-all p5-clip-badge group"
              >
                <LinkedinIcon className="w-5 h-5 text-p5-red shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs text-p5-gray">LINKEDIN NETWORK</div>
                  <div className="text-base truncate">{personalInfo.linkedin}</div>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 bg-black/80 border border-p5-red/20 text-white p5-clip-badge">
                <MapPin className="w-5 h-5 text-p5-red shrink-0" />
                <div>
                  <div className="text-xs text-p5-gray">LOCATION</div>
                  <div className="text-base">{personalInfo.location}</div>
                </div>
              </div>
            </div>

            {/* Resume Download CTA */}
            <div className="pt-4 border-t border-p5-gray-dark/50">
              <a
                href={personalInfo.resumeUrl}
                download="Aryan_Resume.pdf"
                className="w-full bg-p5-red text-black font-heading text-lg py-3 px-4 text-center tracking-widest hover:bg-red-600 transition-colors p5-clip-button font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> DOWNLOAD RESUME
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
