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
        brand: {
          black: "#0D0608",       // Page background — deepest dark
          dark: "#180D10",        // Card backgrounds
          dark2: "#221318",       // Slightly lighter surfaces
          mid: "#3D1F28",         // Borders, dividers
          muted: "#9C7280",       // Secondary text, labels
          light: "#E8D0D8",       // Body text on dark backgrounds
          white: "#FDF6F8",       // Off-white headings
          burgundy: "#8B1A3A",    // PRIMARY ACCENT — CTAs, highlights
          "burgundy-light": "#A82248",  // Hover states
          "burgundy-dark": "#6B1228",   // Active/pressed
          gold: "#C9A84C",        // SECONDARY ACCENT — prices, badges, premium feel
          "gold-light": "#E8C96A", // Gold hover
          rose: "#D4688A",        // Tertiary — lashes, feminine touches
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],    // Ultra-elegant serif for hero
        heading: ["var(--font-playfair)", "Georgia", "serif"],     // Section titles, product names
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],  // Readable on dark backgrounds
      },
      backgroundImage: {
        "linen-texture": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23180D10'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%23221318' opacity='0.5'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%23221318' opacity='0.3'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        "brand-glow": "0 0 30px rgba(139, 26, 58, 0.2)",          // Warm burgundy glow
        "gold-glow": "0 0 30px rgba(201, 168, 76, 0.15)",         // Gold shimmer
      },
      animation: {
        marquee: "marquee 30s linear infinite",                    // Scrolling text animation
        "fade-up": "fadeUp 0.6s ease forwards",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
