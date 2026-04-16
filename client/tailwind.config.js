/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Figtree', 'sans-serif'],
      },
      colors: {
        surface: {
          950: '#080B14',
          900: '#0D1117',
          800: '#111827',
          700: '#161D2E',
          600: '#1C2438',
          500: '#222C42',
          400: '#2D3A54',
        },
        accent: {
          DEFAULT: '#6366F1',
          light:   '#818CF8',
          dim:     '#3730A3',
        },
        teal:  { DEFAULT: '#14B8A6', dim: '#0D9488' },
        rose:  { DEFAULT: '#F43F5E', dim: '#BE123C'  },
        amber: { DEFAULT: '#F59E0B', dim: '#B45309'  },
        emerald:{ DEFAULT: '#10B981', dim: '#059669' },
      },
      animation: {
        'fade-up':   'fadeUp 0.4s ease forwards',
        'fade-in':   'fadeIn 0.3s ease forwards',
        'slide-in':  'slideIn 0.35s ease forwards',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { '0%': { opacity: 0 },                                '100%': { opacity: 1 } },
        slideIn: { '0%': { opacity: 0, transform: 'translateX(-12px)' },'100%': { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}