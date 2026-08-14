import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f2f6fb",
          100: "#dfeaf5",
          500: "#214f7c",
          700: "#12365c",
          800: "#0b2745",
          900: "#071b31"
        },
        gold: {
          400: "#d9af4a",
          500: "#c99a2e",
          600: "#a7781f"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(7, 27, 49, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
