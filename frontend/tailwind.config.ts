import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0e0d",
        surface: "#161412",
        border: "#2a2825",
        "text-primary": "#e8e3da",
        "text-secondary": "#8a847c",
        "text-muted": "#5a5650",
        accent: "#c8b89a",
        live: "#5a9e6f",
      },
    },
  },
  plugins: [],
};
export default config;
