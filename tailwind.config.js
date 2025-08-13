/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      clipPath: {
        'diagonal': 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)',
        'diagonal-mobile': 'polygon(0 30%, 100% 0, 100% 100%, 0% 100%)',
      },
      animation: {
        'blob': 'blob 15s infinite alternate',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '25%': {
            transform: 'translate(20px, 15px) scale(1.1)',
          },
          '50%': {
            transform: 'translate(-15px, 10px) scale(0.9)',
          },
          '75%': {
            transform: 'translate(15px, -20px) scale(1.05)',
          },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.clip-diagonal': {
          'clip-path': 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)',
        },
        '.animate-blob': {
          'animation': 'blob 15s infinite alternate',
        },
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
      }
      addUtilities(newUtilities, ['responsive'])
    }
  ],
}

