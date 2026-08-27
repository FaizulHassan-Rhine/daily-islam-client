/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./contexts/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-secondary": "rgb(var(--color-surface-secondary) / <alpha-value>)",
        "surface-warm": "rgb(var(--color-surface-warm) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-soft": "rgb(var(--color-primary-soft) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
        bn: ["var(--font-bangla)", "var(--font-ui)", "sans-serif"],
        arabic: ["var(--font-arabic)", "serif"],
        quran: ["var(--font-quran)", "var(--font-arabic)", "serif"],
      },
      borderRadius: {
        card: "1.25rem",
        "card-lg": "1.75rem",
      },
      boxShadow: {
        card: "0 8px 30px rgb(30 41 35 / 0.06)",
        glow: "0 0 0 1px rgb(var(--color-border) / 0.8), 0 10px 40px rgb(49 94 75 / 0.08)",
      },
      maxWidth: {
        content: "72rem",
        reader: "48rem",
      },
      spacing: {
        "nav-mobile": "5.5rem",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
