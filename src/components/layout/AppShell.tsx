"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { PWAInstaller } from "../pwa/PWAInstaller";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      <PWAInstaller />
      
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Page Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 lg:pb-12 min-h-screen overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
