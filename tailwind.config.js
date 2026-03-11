/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1142d4',
          50: '#f0f3ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#1142d4', // Ana Stitch mavisi
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        'background-light': '#ffffff',
        'background-dark': '#101522',
        accent: {
          premium: '#1142d4',
          light: '#818cf8',
          dark: '#3730a3',
        }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '1rem',
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
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'gold-glow': '0 0 25px rgba(17, 66, 212, 0.25)',
      }
    },
  },
  plugins: [],
};