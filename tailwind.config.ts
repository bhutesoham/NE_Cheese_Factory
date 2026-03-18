import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cream: {
          50: '#FEFCF5',
          100: '#FDF8E8',
          200: '#FAF0CB',
          300: '#F5E4A0',
          400: '#EDD470',
          500: '#E2C040',
        },
        cheese: {
          50: '#FFF8F0',
          100: '#FEECD8',
          200: '#FDD5A8',
          300: '#FAB668',
          400: '#F79235',
          500: '#E8770F',
          600: '#C45E08',
          700: '#9E4A07',
          800: '#7A390A',
          900: '#5C2A0B',
        },
        forest: {
          50: '#F2F7F2',
          100: '#E0EDE0',
          200: '#BFDBBF',
          300: '#8DC08D',
          400: '#57A057',
          500: '#357835',
          600: '#265926',
          700: '#1E451E',
          800: '#163316',
          900: '#0F230F',
        },
        earth: {
          50: '#FAF8F5',
          100: '#F2EDE6',
          200: '#E3D8C8',
          300: '#CEBCA2',
          400: '#B49B7A',
          500: '#967C57',
          600: '#7A6344',
          700: '#5E4B32',
          800: '#443622',
          900: '#2D2116',
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
