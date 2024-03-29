import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'selector', // TODO: unset this when dark/light styles are figured out and I'm confident in them
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      gridTemplateRows: {
        "layout": "64px auto"
      },
      gridTemplateColumns: {
        "layout": "fit-content(200px) auto"
      },
      boxShadow: {
        "border-r": "1px 0 1px black",
        "border-b": "0 1px 1px black",
        "border-corner": "1px 0 1px black, 0 1px 1px black"
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)"]
      }
    },
  },
  plugins: [],
};
export default config;
