/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "../index.html",
    "../srcs/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cyber: ['Orbitron', 'sans-serif'],
        mono: ['Rajdhani', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
