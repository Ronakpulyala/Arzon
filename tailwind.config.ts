import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Core brand — deep navy (trust/education) + amber (sales/energy)
        navy: {
          950: "#0F1830",
          900: "#16213E",
          800: "#1E2A4A",
          700: "#293659",
          600: "#3A4A73"
        },
        amber: {
          600: "#C97A1E",
          500: "#E8963C",
          400: "#F0AE63",
          100: "#FCEEDC"
        },
        ink: {
          900: "#1A1D29",
          700: "#3D4152",
          500: "#6B7280",
          300: "#C3C7D1",
          100: "#EEF0F4"
        },
        surface: {
          page: "#F4F5F8",
          card: "#FFFFFF"
        },
        success: "#2F9E6E",
        danger: "#C4432E",
        warn: "#D9A441"
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px"
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(15, 24, 48, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
