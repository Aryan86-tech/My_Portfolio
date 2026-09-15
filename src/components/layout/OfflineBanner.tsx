"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("offline", handleOffline);
      window.addEventListener("online", handleOnline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("online", handleOnline);
      }
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-400 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — Changes will sync when connectivity is restored</span>
    </div>
  );
}
