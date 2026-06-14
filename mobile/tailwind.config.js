/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E50914",
          bg: "#07090F",
          card: "#0E1420",
          cardAlt: "#151D2A",
          surface: "#242424",
          text: "#F8F8F8",
          muted: "#A3A3A3",
          stroke: "rgba(255,255,255,0.12)",
          slate: "#1A2332",
          cyan: "#69B7FF",
          gold: "#F3C97A",
        },
      },
      boxShadow: {
        card: "0px 10px 26px rgba(0,0,0,0.42)",
        soft: "0px 8px 20px rgba(0,0,0,0.28)",
        floating: "0px 14px 32px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
