import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B348B",
          dark: "#2E2870",
          light: "#4C44A3",
          muted: "#EEEDF8",
        },
        "gray-bg": "#F5F6FA",
        "text-dark": "#111827",
        "text-muted": "#6B7280",
        "input-border": "#E5E7EB",
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        input: "14px",
        button: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
