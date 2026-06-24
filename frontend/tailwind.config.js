/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fffbf0', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f',
        },
        trust: {
          50: '#f0f6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e3a8a', 900: '#1e2e6e', 950: '#0f1a3d',
        },
        sage: {
          50: '#f2f9f0', 100: '#dcf0d8', 200: '#bbe2b3', 300: '#8fcc83',
          400: '#63b358', 500: '#4a9e40', 600: '#3a7e32', 700: '#2f6228',
          800: '#264f21', 900: '#1f411c',
        },
        warm: {
          50: '#fdf8f0', 100: '#faebd7', 200: '#f5d5ae', 300: '#efba7c',
          400: '#e89648', 500: '#e07820', 600: '#c45f14', 700: '#a04910',
          800: '#7e3911', 900: '#682f11',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        accent:  ['Cormorant Garamond', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card':       '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.12)',
        'float':      '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06)',
        'trust':      '0 4px 14px rgba(30,58,138,0.25)',
        'warm':       '0 4px 14px rgba(251,191,36,0.35)',
      },
      animation: {
        'float-gentle': 'float-gentle 5s ease-in-out infinite',
        'fade-in':      'fade-in 0.5s ease forwards',
        'shimmer':      'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
