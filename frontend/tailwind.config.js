/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a", // Un bleu professionnel pour le thème principal
        secondary: "#f3f4f6", // Un gris clair pour les fonds
      }
    },
  },
  plugins: [],
}