/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
          light: '#EEF2FF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        }
      },
      borderRadius: {
        'card': '2rem',
        'modal': '2.5rem',
        'badge': '0.75rem',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0,0,0,0.05)',
        'md': '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        'lg': '0 20px 50px -12px rgba(99,102,241,0.15)',
        'xl': '0 25px 60px -15px rgba(0,0,0,0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
