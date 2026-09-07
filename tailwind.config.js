/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: {
          DEFAULT: '#0F766E', // rich teal/emerald
          dark: '#115E59',
          light: '#14B8A6',
          foreground: '#FFFFFF',
        },
        danger: {
          DEFAULT: '#E11D48',
          light: '#FFE4E6',
          dark: '#9F1239',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          dark: '#92400E',
        },
        success: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
          dark: '#065F46',
        },
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        }
      },
    },
  },
  plugins: [],
}
