"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("ServiceWorker registered:", reg.scope))
        .catch((err) => console.error("ServiceWorker registration failed:", err));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-cyan-500/40 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-mono">
      <span>Install <strong>WINTER ARC</strong> App</span>
      <button
        onClick={handleInstallClick}
        className="bg-cyan-500 text-zinc-950 font-bold px-3 py-1 rounded-lg hover:bg-cyan-400 flex items-center gap-1.5 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        INSTALL
      </button>
      <button
        onClick={() => setShowInstallBanner(false)}
        className="text-zinc-400 hover:text-slate-200 ml-1"
      >
        ✕
      </button>
    </div>
  );
}
