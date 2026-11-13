/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FAF8F4',
          50: '#FDFCFA',
          100: '#FAF8F4',
          200: '#F5F0E8',
          300: '#EFE7D9',
        },
        burgundy: {
          DEFAULT: '#722F45',
          50: '#F8EEF1',
          100: '#EED6DC',
          200: '#D9A9B6',
          300: '#C27C8F',
          400: '#A44F67',
          500: '#722F45',
          600: '#5F2739',
          700: '#4D1F2E',
          800: '#391722',
          900: '#250F16',
        },
        rose: {
          DEFAULT: '#B76E79',
          50: '#FAF2F3',
          100: '#F4DFE2',
          200: '#E5BAC1',
          300: '#D596A0',
          400: '#C67A85',
          500: '#B76E79',
          600: '#9B525D',
          700: '#7B3C45',
        },
        gold: {
          DEFAULT: '#C5A46D',
          50: '#FBF9F4',
          100: '#F5EFE3',
          200: '#E9DCBF',
          300: '#DCC99A',
          400: '#D0B783',
          500: '#C5A46D',
          600: '#AA8850',
          700: '#896C3E',
        },
        blush: {
          DEFAULT: '#F4E7E8',
          50: '#FDFAF9',
          100: '#F4E7E8',
          200: '#EACFD1',
          300: '#DFB7BB',
        },
        charcoal: {
          DEFAULT: '#252329',
          50: '#888292',
          100: '#6C6775',
          200: '#524E5B',
          300: '#3D3A44',
          DEFAULT: '#252329',
          900: '#151417',
        },
        mutedGray: {
          DEFAULT: '#77727A',
          light: '#A5A0A9',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(114, 47, 69, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'elevated': '0 12px 32px -4px rgba(114, 47, 69, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'luxury': '0 20px 40px -10px rgba(114, 47, 69, 0.12), 0 6px 16px -4px rgba(197, 164, 109, 0.1)',
      }
    },
  },
  plugins: [],
}
