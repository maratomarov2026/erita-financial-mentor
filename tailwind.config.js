/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EF",
        paper: "#FFFDF9",
        terracotta: {
          DEFAULT: "#C97B63",
          dark: "#B0634C",
          light: "#E3A893",
        },
        sage: {
          DEFAULT: "#8FA998",
          dark: "#6F8A78",
          light: "#C9D9CD",
        },
        blush: "#F3DCD4",
        warmbrown: "#4A3F35",
        muted: "#8A7E72",
      },
      fontFamily: {
        sans: ["'Nunito'", "'Segoe UI'", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(74, 63, 53, 0.08)",
      },
    },
  },
  plugins: [],
};
