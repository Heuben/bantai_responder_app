/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        raised: 'rgb(var(--raised) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        'primary-ink': 'rgb(var(--primary-ink) / <alpha-value>)',
        urgent: 'rgb(var(--urgent) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        map: 'rgb(var(--map) / <alpha-value>)',
        'map-block': 'rgb(var(--map-block) / <alpha-value>)',
        'map-road': 'rgb(var(--map-road) / <alpha-value>)',
        // Data-viz accents — driver_responder_inspiration.jpg
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
        },
        cyan: {
          DEFAULT: 'rgb(var(--cyan) / <alpha-value>)',
          soft: 'rgb(var(--cyan-soft) / <alpha-value>)',
        },
        violet: {
          DEFAULT: 'rgb(var(--violet) / <alpha-value>)',
          soft: 'rgb(var(--violet-soft) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.06), 0 1px 3px rgb(15 23 42 / 0.04)',
        lift: '0 8px 24px -8px rgb(15 23 42 / 0.22)',
        'lift-lg': '0 12px 32px -8px rgb(15 23 42 / 0.28)',
      },
      keyframes: {
        ping2: { '0%': { transform: 'scale(1)', opacity: '0.5' }, '100%': { transform: 'scale(2.6)', opacity: '0' } },
      },
      animation: { ping2: 'ping2 2s cubic-bezier(0, 0, 0.2, 1) infinite' },
    },
  },
  plugins: [],
}
