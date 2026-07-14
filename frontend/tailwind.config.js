/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#7C3AED',
        accent: '#06B6D4',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        card: 'var(--card-bg)',
        'card-hover': 'var(--card-hover-bg)',
        border: 'var(--border-color)',
        'border-strong': 'var(--border-strong)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.04), 0 20px 80px rgba(99, 102, 241, 0.18)',
        'glow-sm': '0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px rgba(99, 102, 241, 0.12)',
        'glow-md': '0 0 0 1px rgba(255,255,255,0.06), 0 12px 48px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(99, 102, 241, 0.2)',
        'glow-xl': '0 0 0 1px rgba(255,255,255,0.1), 0 32px 100px rgba(99, 102, 241, 0.25)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '80%': { transform: 'scale(1.8)', opacity: '0' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        logoGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(99,102,241,0.6)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '25%': { transform: 'translate(10px, -10px)' },
          '50%': { transform: 'translate(-5px, -15px)' },
          '75%': { transform: 'translate(-10px, 5px)' },
        },
        floatCard: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-4px) scale(1.01)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.9' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2.4s cubic-bezier(0.4,0,0.2,1) infinite',
        floatSlow: 'floatSlow 5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        pulseSoft: 'pulseSoft 3s ease-in-out infinite',
        logoGlow: 'logoGlow 3s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
        floatCard: 'floatCard 6s ease-in-out infinite',
        breathe: 'breathe 4s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
      },
    },
  },
  plugins: [],
};
