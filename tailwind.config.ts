import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        na: {
          heket: "#086357",
          kefer: "#009485",
          amon: "#f39300",
          helios: "#ffca00",
          heketDark: "#086357",
          ink: "#1d1d1b",
          muted: "#4a5754",
          surface: "#ffffff",
          editorial: "#EA7604",
          editorialDark: "#CD4B0C",
          footer: "#086357",
          civis: "#5BA6DC",
          civisDark: "#4A86B0",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "na-soft": "0 20px 60px rgba(8, 99, 87, 0.12)",
        "na-card": "0 18px 48px rgba(8, 99, 87, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
