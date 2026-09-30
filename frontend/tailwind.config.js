export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        cinzel: ["'Cinzel'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      colors: {
        ink: "#1c1917",
        saffron: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f"
        },
        sacred: {
          dark: "#0c0f17",
          card: "#151b26",
          gold: "#eab308",
          amber: "#d97706"
        },
        leaf: "#0f766e",
        clay: "#9a3412"
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(217, 119, 6, 0.25)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 2px 8px -2px rgba(0, 0, 0, 0.03)"
      }
    }
  },
  plugins: []
};
