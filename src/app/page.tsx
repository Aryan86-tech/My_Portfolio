"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NavigationWheel } from "@/components/NavigationWheel";
import { PageTransitionWipe } from "@/components/PageTransitionWipe";
import { PersonaSection } from "@/components/sections/PersonaSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { ExtracurricularSection } from "@/components/sections/ExtracurricularSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { navigationItems } from "@/data/portfolioData";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [isWiping, setIsWiping] = useState(false);

  // Trigger Crimson Red Page Wipe Transition
  const handleSelectRoute = useCallback((routeId: string) => {
    setPendingRoute(routeId);
    setIsWiping(true);
  }, []);

  const handleWipeEnd = useCallback(() => {
    if (pendingRoute !== null) {
      setActiveRoute(pendingRoute === "home" ? null : pendingRoute);
      setPendingRoute(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsWiping(false);
  }, [pendingRoute]);

  const handleGoHome = useCallback(() => {
    if (activeRoute !== null) {
      handleSelectRoute("home");
    }
  }, [activeRoute, handleSelectRoute]);

  // Keyboard navigation shortcuts (Keys 1-8 and ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSplash || isWiping) return;

      if (e.key === "Escape") {
        handleGoHome();
      } else if (!isNaN(Number(e.key)) && Number(e.key) >= 1 && Number(e.key) <= navigationItems.length) {
        const targetItem = navigationItems[Number(e.key) - 1];
        if (targetItem) {
          handleSelectRoute(targetItem.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSplash, isWiping, handleGoHome, handleSelectRoute]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Render sub-section based on active route
  const renderSection = () => {
    switch (activeRoute) {
      case "persona":
        return <PersonaSection />;
      case "education":
        return <EducationSection />;
      case "skills":
        return <SkillsSection />;
      case "projects":
        return <ProjectsSection />;
      case "experience":
        return <ExperienceSection />;
      case "achievements":
        return <AchievementsSection />;
      case "extracurricular":
        return <ExtracurricularSection />;
      case "contact":
        return <ContactSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Red Screen Wipe Overlay */}
      <PageTransitionWipe isWiping={isWiping} onWipeEnd={handleWipeEnd} />

      {/* Top Header */}
      <Header activeRoute={activeRoute} onGoHome={handleGoHome} />

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full relative z-10">
        {activeRoute === null ? (
          /* Landing Command Menu Wheel */
          <NavigationWheel activeRoute="" onSelectRoute={handleSelectRoute} />
        ) : (
          /* Sub-Page View Container */
          <div className="space-y-8">
            {/* Back Button */}
            <button
              onClick={handleGoHome}
              className="inline-flex items-center gap-2 bg-black/80 text-p5-red border border-p5-red/40 px-4 py-2 text-sm font-heading tracking-widest hover:bg-p5-red hover:text-black transition-colors p5-clip-button font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              RETURN TO COMMAND HUB [ESC]
            </button>

            {/* Active Section Content */}
            {renderSection()}
          </div>
        )}
      </main>

      {/* Bottom Control Bar */}
      <Footer />
    </div>
  );
}
