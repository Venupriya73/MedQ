import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0F0D",
        surface: "#1A1F1C",
        surfaceHover: "#222824",
        border: "#2A312C",
        amber: {
          DEFAULT: "#F5A623",
          dim: "#B8801C",
          glow: "#FFC15E",
        },
        emerald: {
          DEFAULT: "#0F9D58",
          dim: "#0B7A44",
          glow: "#3FD487",
        },
        ink: {
          DEFAULT: "#E8E6E1",
          muted: "#9CA3A8",
          faint: "#6B7280",
        },
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
      },
      backgroundImage: {
        "token-gradient": "linear-gradient(135deg, #F5A623 0%, #FFC15E 100%)",
        "emerald-gradient": "linear-gradient(135deg, #0F9D58 0%, #3FD487 100%)",
      },
    },
  },
  plugins: [],
};
export default config;