/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat"],
        afacadFlux: ["Afacad Flux"],
        notoSansJapanese: ["Noto Sans JP"],
        maxSans: ["Max Sans"],
        lobster: ["Lobster"],
      },
    },
  },
  variants: {
    extend: {
      filter: ["hover"],
    },
  },
  plugins: [],
};
