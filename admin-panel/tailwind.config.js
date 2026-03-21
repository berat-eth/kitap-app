/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0c0f14',
          900: '#12161e',
          800: '#1a2029',
          700: '#252d3a',
        },
        accent: {
          DEFAULT: '#e8a54b',
          dim: '#c4893d',
          glow: '#f4c47a',
        },
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px -12px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};
