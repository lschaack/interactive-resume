import type { Config } from "tailwindcss";

import colors from 'tailwindcss/colors';

const config: Config = {
  darkMode: 'selector', // TODO: unset this when dark/light styles are figured out and I'm confident in them
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      ...colors,
      foreground: {
        light: colors.black,
        DEFAULT: colors.black,
        dark: colors.white,
      },
      background: {
        light: colors.white,
        DEFAULT: colors.white,
        dark: colors.black,
      },
      highlight: {
        light: colors.slate['100'],
        DEFAULT: colors.slate['100'],
        dark: colors.slate['800'],
      },
      accent: {
        light: colors.amber[500],
        DEFAULT: colors.amber[500],
        dark: colors.amber[500],
      }
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      gridTemplateRows: {
        "layout-desktop": "minmax(64px, auto) auto",
        "layout-mobile": "minmax(64px, auto) auto",
      },
      gridTemplateColumns: {
        "layout-desktop": "fit-content(200px) auto",
        "layout-mobile": "auto",
      },
      boxShadow: {
        "outline": '0 0 0 4px theme(colors.accent.DEFAULT)',
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)"],
        mono: ["var(--font-noto-sans-mono)"],
      }
    },
  },
  plugins: [],
};
export default config;
