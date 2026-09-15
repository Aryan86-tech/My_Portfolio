import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "WINTER ARC — Personal Discipline RPG",
  description: "Build yourself in the winter. Real-life actions become game progression.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WINTER ARC",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-zinc-950 text-slate-100 min-h-screen relative overflow-x-hidden antialiased font-sans">
        <OfflineBanner />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
