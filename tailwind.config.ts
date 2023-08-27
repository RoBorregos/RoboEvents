import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffffff",
        secondary: "#000000",
        tertiary: "#f3e3e2",
        highlight: "#1b2e3c",
        error: "#4b0000",
        themebg: "#0c0c1e",
      },
      screens: {
        xsm: "520px",
      },
    },
  },
  plugins: [],
} satisfies Config;
