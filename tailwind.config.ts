import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Light marketing surface
        paper: "#FAFAF7",
        cream: "#F5F1E8",

        // Dark app surface tokens (used by dashboard + auth)
        bg: {
          DEFAULT: "#0A0612",
          raised: "#120A1F",
          card: "#1A0F2E",
        },
        ink: {
          DEFAULT: "#F5F1FF",
          dim: "#B8A8D9",
          mute: "#7C6DA0",
        },

        // Brand (works on both light and dark)
        brand: {
          DEFAULT: "#A855F7",
          glow: "#C084FC",
          deep: "#7C3AED",
          ink: "#6B21A8",
        },
        accent: {
          DEFAULT: "#06B6D4",
          glow: "#22D3EE",
          deep: "#0891B2",
        },
        warm: {
          DEFAULT: "#F97316",
          glow: "#FB923C",
        },

        line: "#2A1B4A", // dark theme line
        "line-soft": "#E5DFEF", // light theme line
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #A855F7 0%, #06B6D4 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
