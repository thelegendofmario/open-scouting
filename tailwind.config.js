/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./scouting/main/templates/*.html"
  ],
  theme: {
    extend: {
      borderWidth: {
        "1": "1px",
      }
    },
  },
  plugins: [],
}

