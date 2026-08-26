import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // VedaAI design tokens
        orange: {
          DEFAULT: "#FF5500",
          50: "#FFF3EE",
          100: "#FFE6D5",
          200: "#FFCCAA",
          300: "#FFB282",
          400: "#FF8844",
          500: "#FF5500",
          600: "#E04A00",
          700: "#B83C00",
          800: "#8F2E00",
          900: "#6B2200",
        },
        veda: {
          orange: "#FF5500",
          bg: "#F6F6F6",
          surface: "#FFFFFF",
          dark: "#21262C",
          secondary: "#606266",
          border: "#E2E2E2",
          "border-light": "#F0F0F0",
          green: "#22C55E",
          "green-bg": "#F0FDF4",
          "orange-bg": "#FFF8F5",
          sidebar: "#FFFFFF",
          "sidebar-hover": "#F6F6F6",
          "sidebar-active": "#FFF3EE",
        },
      },
      fontFamily: {
        sans: ["Figtree", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        inter: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.12)",
        upload: "0 2px 8px rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "highlight-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 3px rgba(255, 85, 0, 0.4)" },
          "50%": { boxShadow: "0 0 0 6px rgba(255, 85, 0, 0.2)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "highlight-pulse": "highlight-pulse 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
