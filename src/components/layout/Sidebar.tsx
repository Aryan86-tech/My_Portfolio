"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  CheckSquare,
  Dumbbell,
  TrendingUp,
  User,
  Calendar,
  Apple,
  Scale,
  Trophy,
  Settings,
  LogOut,
  Snowflake,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const mainNav = [
    { name: "HOME", href: "/dashboard", icon: Home },
    { name: "QUESTS", href: "/quests", icon: CheckSquare },
    { name: "WORKOUT", href: "/workout", icon: Dumbbell },
    { name: "BODY", href: "/body", icon: Scale },
    { name: "NUTRITION", href: "/nutrition", icon: Apple },
    { name: "PROGRESS", href: "/progress", icon: TrendingUp },
  ];

  const secondaryNav = [
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Achievements", href: "/achievements", icon: Trophy },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-zinc-950 border-r border-zinc-800/80 min-h-screen p-4 sticky top-0 h-screen select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-zinc-800/60">
        <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/50">
          <Snowflake className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-wider text-slate-100 font-mono">
            WINTER ARC
          </h2>
          <p className="text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase">
            Build Yourself
          </p>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="space-y-1 mb-8">
        <div className="px-3 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
          CORE SYSTEM
        </div>
        {mainNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all duration-150 ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-950"
                  : "text-zinc-400 hover:text-slate-200 hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-zinc-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Secondary Navigation */}
      <div className="space-y-1 mb-auto">
        <div className="px-3 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
          ANALYTICS & BODY
        </div>
        {secondaryNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all duration-150 ${
                isActive
                  ? "bg-zinc-800 text-slate-100 border border-zinc-700"
                  : "text-zinc-400 hover:text-slate-200 hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 text-zinc-400" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Logout */}
      <div className="pt-4 border-t border-zinc-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>LOGOUT</span>
        </button>
      </div>
    </aside>
  );
}
