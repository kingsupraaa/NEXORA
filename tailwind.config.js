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
          DEFAULT: '#EE4326', // Vibrant Orange-Coral matching reference
          dark: '#D03117',
          light: '#FF6B52',
          foreground: '#FFFFFF',
        },
        coral: {
          50: '#FFF5F3',
          100: '#FFE8E4',
          200: '#FFD5CE',
          500: '#FF6B52',
          600: '#EE4326',
          700: '#D03117',
          800: '#A82410',
          900: '#7C190B',
        },
        dark: {
          DEFAULT: '#111827',
          50: '#F8FAFC',
          800: '#1E293B',
          900: '#0F172A',
          950: '#090D16',
        },
        danger: {
          DEFAULT: '#EE4326',
          light: '#FFEAE6',
          dark: '#B91C1C',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#047857',
        }
      },
    },
  },
  plugins: [],
}
