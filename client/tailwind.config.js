/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F97316', // primary orange
          dark: '#EA580C',
          green: '#16A34A',
        },
        surface: '#FFFBF5', // warm off-white background
        ink: { DEFAULT: '#1C1917', soft: '#78716C' },
        line: '#E7E5E4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '16px' },
    },
  },
  plugins: [],
};
