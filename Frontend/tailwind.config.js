/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm off-white canvas + true-white surface, per the sage-green identity.
        canvas: '#F5F6F1',
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#E1E5DB',
          strong: '#CCD3C3',
        },
        ink: {
          900: '#242A25', // charcoal, not pure black
          700: '#3F473F',
          500: '#6C7568', // muted gray-green
          400: '#98A092',
        },
        accent: {
          50: '#EEF2ED',
          100: '#DDE7DE', // soft sage
          400: '#AFC1B3', // muted sage
          500: '#7F9C86', // primary sage — main actions
          600: '#526B59', // dark sage — hover/active
          700: '#34463A', // deep forest — emphasis
        },
        success: {
          50: '#EEF3E9',
          500: '#6B8F5E',
          600: '#557649',
        },
        danger: {
          50: '#FBEEEC',
          500: '#B8544A',
          600: '#9C453C',
        },
        warning: {
          50: '#FBF3E7',
          500: '#B08A3E',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        control: '7px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(36, 42, 37, 0.04)',
        card: '0 1px 2px rgba(36, 42, 37, 0.05)',
        raised: '0 6px 18px rgba(36, 42, 37, 0.08), 0 1px 3px rgba(36, 42, 37, 0.05)',
      },
      transitionDuration: {
        DEFAULT: '160ms',
      },
      keyframes: {
        'toast-in': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'toast-in': 'toast-in 180ms ease-out',
        'fade-in': 'fade-in 160ms ease-out',
        'scale-in': 'scale-in 160ms ease-out',
      },
    },
  },
  plugins: [],
}
