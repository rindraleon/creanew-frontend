import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base — CreaNew identité extraite du logo
        background: "#FFFBF5",
        "on-background": "#1A1A1A",
        // Jetons nécessaires aux composants shadcn/ui, sans modifier la palette existante.
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        surface: "#FFFBF5",
        "on-surface": "#1A1A1E",
        "on-surface-variant": "#6B6560",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F9F3EA",
        "surface-container": "#F3EBD8",
        "surface-container-high": "#EDE4D2",
        "surface-container-highest": "#E4D9C0",
        "surface-dim": "#DED5BF",
        "surface-bright": "#FFFBF5",
        "surface-variant": "#E8DDC3",
        // Charbon — titres & contrastes (logo CreaNew)
        primary: {
          DEFAULT: "#121214",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        "on-primary": "#FFFFFF",
        "primary-container": "#2A2A2E",
        "on-primary-container": "#B8B2A8",
        "primary-fixed": "#1E1E1E",
        "primary-fixed-dim": "#C9C5BF",
        // Or / Ocre — accent CreaNew (extrait du logo)
        secondary: {
          DEFAULT: "#C49A3C",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        "on-secondary": "#FFFFFF",
        "secondary-container": "#FFF2D0",
        "on-secondary-container": "#7A5D1A",
        "secondary-fixed": "#F2D78A",
        "secondary-fixed-dim": "#C8A251",
        // Doré profond pour CTA primary
        gold: {
          50: "#FFF9E6",
          100: "#FFF2C7",
          200: "#F2D78A",
          300: "#C8A251",
          400: "#B78E2E",
          500: "#C49A3C",
          600: "#9E7B2F",
          700: "#7A5D1A",
        },
        tertiary: "#1A1A1E",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#2E2D2B",
        outline: "#9C9790",
        "outline-variant": "#D9D0BB",
        error: "#B3261E",
        "on-error": "#FFFFFF",
        "error-container": "#F9DEDC",
        "on-error-container": "#410E0B",
      },
      fontFamily: {
        display: ["Libre Caslon Text", "Georgia", "serif"],
        body: ["Hanken Grotesk", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["72px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["56px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["40px", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "headline-lg": ["36px", { lineHeight: "1.25" }],
        "headline-md": ["30px", { lineHeight: "1.3" }],
        "headline-sm": ["22px", { lineHeight: "1.4" }],
        "body-lg": ["18px", { lineHeight: "1.65" }],
        "body-md": ["16px", { lineHeight: "1.6" }],
        "body-sm": ["14px", { lineHeight: "1.6" }],
        "label-lg": ["15px", { lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "600" }],
        "label-md": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "1.2", letterSpacing: "0.03em", fontWeight: "500" }],
      },
      boxShadow: {
        card: "0 2px 12px rgba(26,26,30,0.06)",
        "card-hover": "0 20px 40px rgba(26,26,30,0.10)",
        drawer: "-10px 0 40px rgba(26,26,30,0.12)",
        gold: "0 4px 16px rgba(196,154,60,0.28)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-left": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(16px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16,1,0.3,1)",
        "slide-left": "slide-left 0.35s cubic-bezier(0.16,1,0.3,1)",
        "slide-down": "slide-down 0.25s ease-out",
        "toast-in": "toast-in 0.3s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
