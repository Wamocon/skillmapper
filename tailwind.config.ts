import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f0e7",
        ink: "#122620",
        rust: "#9a3412",
        moss: "#294f3f",
        fog: "#e9dfcf",
      },
      boxShadow: {
        panel: "0 20px 50px -30px rgba(18, 38, 32, 0.5)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.8s ease forwards",
      },
      fontFamily: {
        heading: ["'DM Serif Display'", "serif"],
        body: ["'Source Sans 3'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
