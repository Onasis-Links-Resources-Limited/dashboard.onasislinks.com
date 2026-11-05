// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#280905',
          800: '#740A03',
          700: '#C3110C',
          600: '#E6501B',
        }
      }
    },
  },
  plugins: [],
}