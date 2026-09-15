"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("ServiceWorker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.error("ServiceWorker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
