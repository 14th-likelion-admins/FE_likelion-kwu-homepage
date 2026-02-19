/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', // 루트 HTML
    './src/**/*.{js,jsx,ts,tsx}', // src 폴더 안 모든 JS/JSX/TS/TSX
  ],
  theme: {
    extend: {
      keyframes: {
        'marquee-slow': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'marquee-slow': 'marquee-slow 30s linear infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
      })
    },
  ],
}
