"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, Dumbbell, Scale, Apple, TrendingUp } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Quests", href: "/quests", icon: CheckSquare },
    { name: "Workout", href: "/workout", icon: Dumbbell },
    { name: "Body", href: "/body", icon: Scale },
    { name: "Nutrition", href: "/nutrition", icon: Apple },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? "text-cyan-400 font-bold bg-cyan-950/50 border border-cyan-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400" : "text-zinc-400"}`} />
              <span className="text-[10px] font-mono mt-1 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
