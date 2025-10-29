/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // adjust to your project
  ],
  theme: {
    extend: {
      keyframes: {
        floatUpDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-12px)' },
        },
        rotateRing: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        microSpin: {
          '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
      },
      animation: {
        floatUpDown: 'floatUpDown 4s ease-in-out infinite alternate',
        rotateRing: 'rotateRing 6s linear infinite',
        microSpin: 'microSpin 2.5s linear infinite',
      },
      perspective: {
        800: '800px',
      },
    },
  },
  plugins: [],
}
