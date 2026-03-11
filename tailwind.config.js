/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5b13ec',
          50: '#f3f0ff',
          100: '#e9e3ff',
          200: '#d7cdff',
          300: '#bcabff',
          400: '#9e7fff',
          500: '#844cff',
          600: '#7525ff',
          700: '#5b13ec', // New Primary Stitch Color
          800: '#480fbc',
          900: '#3c0e99',
          950: '#260868',
        },
        'background-light': '#ffffff',
        'background-dark': '#0f172a',
        accent: {
          premium: '#5b13ec',
          light: '#9e7fff',
          dark: '#3c0e99',
        }
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        inter: ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.75rem', // ROUND_TWELVE
        'md': '0.375rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        'full': '9999px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '7xl': '80rem',
        '8xl': '88rem',
      },
      boxShadow: {
        'premium': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'premium-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.12)',
        'glow': '0 0 25px rgba(91, 19, 236, 0.25)',
      }
    },
  },
  plugins: [],
};