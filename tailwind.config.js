/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        hermes: {
          'bg':       '#f6f2ea',
          'surface':  '#ffffff',
          'glass':    '#fdfbf8',
          'gold':     '#c9a94e',
          'gold-light': '#e0c86a',
          'gold-dark':  '#a8882e',
          'amber':    '#d4943a',
          'text':     '#1a1612',
          'text-muted': '#8a8070',
          'text-light': '#c0b8a8',
          'border':   '#e8e0d4',
          'line':     '#f0ece4',
        }
      },
      boxShadow: {
        'card':   '0 1px 4px rgba(26,22,18,0.04), 0 1px 2px rgba(26,22,18,0.02)',
        'card-hover': '0 6px 24px rgba(26,22,18,0.06), 0 2px 4px rgba(26,22,18,0.03)',
        'glass':  '0 2px 12px rgba(26,22,18,0.03)',
        'gold':   '0 0 24px rgba(201,169,78,0.12)',
      },
      animation: {
        'fadeIn':   'fadeIn 0.3s ease-out',
        'slideUp':  'slideUp 0.3s ease-out',
        'glow':     'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
