import type { Config } from "tailwindcss";

// Palette officielle KamalPharMédis
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          deep: "#1A3A8F",
          main: "#2454C7",
          frost: "#F4F7FF",
          mist: "#E8EEFF",
          soft: "#E0E8F7",
        },
        green: {
          main: "#2EA138",
          pale: "#E0F3E5",
          dark: "#1C7D2E",
        },
        ink: "#111827",
        // Couleurs pastel par catégorie, reprises de la maquette Figma
        category: {
          blue: { bg: "#E8EEFF", text: "#2454C7" },
          green: { bg: "#E0F3E5", text: "#1C7D2E" },
          purple: { bg: "#F2E3FA", text: "#8C26A6" },
          orange: { bg: "#FFF2E0", text: "#CC6600" },
          red: { bg: "#FFE5EB", text: "#CC1A33" },
          cyan: { bg: "#E0F7FA", text: "#2454C7" },
        },
        status: {
          success: "#1C7D2E",
          warning: "#F57C00",
          danger: "#E53935",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(26, 58, 143, 0.12)",
        soft: "0 4px 14px 0 rgba(26,56,143,0.07)",
        lifted: "0 8px 24px 0 rgba(26,56,143,0.22)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
