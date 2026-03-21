// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
        accent: ["Playfair Display", "Georgia", "serif"],
      },
      colors: {
        gold: {
          DEFAULT: "#C8960C",
          light: "#E8B842",
          muted: "#F0C060",
          dim: "#8B6A08",
        },
        ivory: {
          DEFAULT: "#FDFAF4",
          dark: "#F5EFE0",
        },
        forest: {
          DEFAULT: "#2D4A3E",
          light: "#4A7A6A",
        },
        ink: {
          DEFAULT: "#1A1208",
          muted: "#3D3025",
          light: "#6B5D4F",
        },
        border: {
          DEFAULT: "#E8DCC8",
          light: "#F0E8D8",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease both",
        "fade-in-up": "fadeInUp 0.5s ease both",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.4,0,0.2,1) both",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
