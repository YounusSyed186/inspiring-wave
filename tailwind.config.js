/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Anton", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "'Instrument Sans'", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "'Instrument Serif'", "Georgia", "serif"],
        mono: ["var(--font-mono)", "'IBM Plex Mono'", "monospace"],
      },
      colors: {
        "chart-1": "var(--color-chart-1, #1945f5)",
        "chart-2": "var(--color-chart-2, #8fb9d9)",
        "chart-3": "var(--color-chart-3, #4d6aff)",
        "chart-4": "var(--color-chart-4, #16a6a1)",
        "chart-5": "var(--color-chart-5, #c8deed)",
        border: "hsl(var(--border, 240 5.9% 90%))",
        input: "hsl(var(--input, 240 5.9% 90%))",
        ring: "hsl(var(--ring, 240 5.9% 10%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 240 10% 3.9%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 240 5.9% 10%))",
          foreground: "hsl(var(--primary-foreground, 0 0% 98%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 240 4.8% 95.9%))",
          foreground: "hsl(var(--secondary-foreground, 240 5.9% 10%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 240 4.8% 95.9%))",
          foreground: "hsl(var(--muted-foreground, 240 3.8% 46.1%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 240 4.8% 95.9%))",
          foreground: "hsl(var(--accent-foreground, 240 5.9% 10%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84.2% 60.2%))",
          foreground: "hsl(var(--destructive-foreground, 0 0% 98%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%))",
          foreground: "hsl(var(--card-foreground, 240 10% 3.9%))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover, 0 0% 100%))",
          foreground: "hsl(var(--popover-foreground, 240 10% 3.9%))",
        },
      },
    },
  },
  plugins: [],
};
