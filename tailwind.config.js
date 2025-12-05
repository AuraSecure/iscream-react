/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "hot-pink": "#FF007F",
        "electric-aqua": "#00FFFF",
        "cream-white": "#FFF8F0",
        "soft-yellow": "#FFE680",
        "retro-orange": "#FFAA33",
        "charcoal-gray": "#333333",
      },
      fontFamily: {
        heading: ['"Bangers"', "cursive"],
        body: ['"Nunito Sans"', "sans-serif"],
      },
      animation: {
        "fade-in": "fade-in 1s ease-out forwards",
        "slide-out-left-and-rotate": "slide-out-left-and-rotate 2s ease-out forwards",
        "slide-in-from-right-and-rotate": "slide-in-from-right-and-rotate 2s ease-out forwards",
        "slide-left-only": "slide-left-only 2s ease-out forwards",
        "slide-out-right-and-rotate": "slide-out-right-and-rotate 2s ease-out forwards",
        "slide-in-from-left-and-rotate": "slide-in-from-left-and-rotate 2s ease-out forwards",
        "slide-right-only": "slide-right-only 2s ease-out forwards",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-out-left-and-rotate": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1", "z-index": 10 },
          "100%": { transform: "translateX(-120%) rotate(-30deg)", opacity: "0", "z-index": 10 },
        },
        "slide-in-from-right-and-rotate": {
          "0%": { transform: "translateX(0) rotate(30deg)", opacity: "0", "z-index": 10 },
          "100%": { transform: "translateX(-100%) rotate(0deg)", opacity: "1", "z-index": 10 },
        },
        "slide-left-only": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(-100% - 1.5rem))" },
        },
        "slide-out-right-and-rotate": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1", "z-index": 10 },
          "100%": { transform: "translateX(120%) rotate(30deg)", opacity: "0", "z-index": 10 },
        },
        "slide-in-from-left-and-rotate": {
          "0%": { transform: "translateX(0) rotate(-30deg)", opacity: "0", "z-index": 10 },
          "100%": { transform: "translateX(100%) rotate(0deg)", opacity: "1", "z-index": 10 },
        },
        "slide-right-only": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(calc(100% + 1.5rem))" },
        },
      },
    },
  },
  plugins: [],
};
