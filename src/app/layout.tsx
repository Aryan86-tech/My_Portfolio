import type { Metadata, Viewport } from "next";
import "./globals.css";
import { personalInfo } from "@/data/portfolioData";

export const viewport: Viewport = {
  themeColor: "#FF0000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Aryan — Computer Science Student & Developer",
  description:
    "Portfolio of Aryan, a Computer Science Engineering student at IIIT Sonepat building projects across software development, AI and modern web technologies.",
  keywords: [
    "Aryan",
    "IIIT Sonepat",
    "Computer Science Student",
    "Software Developer",
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "LangGraph",
    "Flutter",
    "Hackathon",
  ],
  authors: [{ name: "Aryan" }],
  openGraph: {
    title: "Aryan — Computer Science Student & Developer",
    description:
      "Portfolio of Aryan, a Computer Science Engineering student at IIIT Sonepat building projects across software development, AI and modern web technologies.",
    type: "website",
    locale: "en_US",
    siteName: "Aryan Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aryan — Computer Science Student & Developer",
    description:
      "Portfolio of Aryan, a Computer Science Engineering student at IIIT Sonepat building projects across software development, AI and modern web technologies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-background text-foreground min-h-screen font-body relative overflow-x-hidden antialiased">
        {/* Universal P5 Background Texture */}
        <div className="fixed inset-0 p5-stripe-bg pointer-events-none z-0 opacity-40" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
