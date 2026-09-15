import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-zinc-900/80 border border-zinc-800/50", className)}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-mono">
      {/* Header Banner Skeleton */}
      <div className="h-32 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6" />

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-28 bg-zinc-900/80 border border-zinc-800 rounded-2xl" />
          <div className="h-64 bg-zinc-900/80 border border-zinc-800 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <div className="h-44 bg-zinc-900/80 border border-zinc-800 rounded-2xl" />
          <div className="h-44 bg-zinc-900/80 border border-zinc-800 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
