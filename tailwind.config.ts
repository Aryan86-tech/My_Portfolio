import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ffffff",
        p5: {
          red: "#FF0000",
          crimson: "#DC143C",
          darkred: "#8B0000",
          black: "#0A0A0A",
          surface: "#1A1A1A",
          card: "#1E1E20",
          gray: "#888888",
          "gray-dark": "#333333",
          yellow: "#FFD700",
        },
      },
      fontFamily: {
        heading: ["'Bebas Neue'", "Impact", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        "p5-stripe": "p5-stripe-move 0.8s linear infinite",
        "p5-glow": "p5-glow 2s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        "p5-stripe-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "40px 40px" },
        },
        "p5-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(255, 0, 0, 0.4)" },
          "50%": { boxShadow: "0 0 25px rgba(255, 0, 0, 0.8), 0 0 40px rgba(255, 0, 0, 0.4)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
