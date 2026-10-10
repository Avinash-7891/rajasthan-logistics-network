/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        rajasthan: {
          saffron: '#FF9933',
          sand: '#E6C280',
          blue: '#1E3A8A',
          maroon: '#800000',
          fort: '#B45309'
        }
      }
    },
  },
  plugins: [],
}
