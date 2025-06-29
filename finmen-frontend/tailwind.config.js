/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'finmen-primary': '#6B7280', // Blue gradient start
        'finmen-secondary': '#FFF7F0', // Purple gradient end
        'finmen-gray': '#F9FAFB', // Light gray background
        'finmen-dark-gray': '#374151', // Dark gray for text
        'finmen-accent': '#F472B6', // Pink accent for buttons
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};