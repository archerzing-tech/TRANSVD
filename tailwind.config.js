/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cinematic Pro — deep charcoal with warm amber accent
        brand: {
          50: "#FDF8F0",
          100: "#F9EDD6",
          200: "#F2D9A8",
          300: "#E8C47A",
          400: "#D8B06A",
          500: "#C89B5A",
          600: "#B8894A",
          700: "#9A7040",
          800: "#7A5A38",
          900: "#5C442E",
          950: "#3D2D1E",
        },
        surface: {
          50: "#F5F5F0",
          100: "#E8E8E0",
          200: "#D0D0C4",
          300: "#A3A39A",
          400: "#838378",
          500: "#6B6B60",
          600: "#545449",
          700: "#3D3D36",
          800: "#2A2A26",
          850: "#1A1A18",
          900: "#111110",
          950: "#0C0C0C",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(200,155,90,0.15)" },
          "50%": { boxShadow: "0 0 20px rgba(200,155,90,0.3)" },
        },
      },
    },
  },
  plugins: [],
};
