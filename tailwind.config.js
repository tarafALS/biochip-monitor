/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: 'rgb(var(--bg-rgb) / <alpha-value>)',
        ink: 'rgb(var(--fg-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        line: 'var(--line)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        blood: 'rgb(var(--blood-rgb) / <alpha-value>)',
        ok: 'rgb(var(--ok-rgb) / <alpha-value>)',
        warn: 'rgb(var(--warn-rgb) / <alpha-value>)',
        crit: 'rgb(var(--crit-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"Chakra Petch"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        pulseRing: { '0%': { transform: 'scale(.9)', opacity: '.8' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        rise: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'none', opacity: '1' } },
      },
      animation: {
        pulseRing: 'pulseRing 1.6s ease-out infinite',
        rise: 'rise .5s ease-out both',
      },
    },
  },
  plugins: [],
}
