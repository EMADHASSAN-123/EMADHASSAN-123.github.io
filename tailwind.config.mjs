/** @type {(name: string) => string} */
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,md,mdx,json,svg}'],
  // Resolved theme is written to <html data-theme="dark|light"> before first paint.
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: 'var(--layout-gutter)',
      screens: { '2xl': '1280px' },
    },
    // Modular scale 1.25 (Major Third), base 16px.
    fontSize: {
      sm: ['0.8rem', { lineHeight: 'var(--leading-body)' }],
      base: ['1rem', { lineHeight: 'var(--leading-body)' }],
      lg: ['1.25rem', { lineHeight: 'var(--leading-body)' }],
      xl: ['1.563rem', { lineHeight: 'var(--leading-heading)' }],
      '2xl': ['1.953rem', { lineHeight: 'var(--leading-heading)' }],
      '3xl': ['2.441rem', { lineHeight: 'var(--leading-heading)' }],
      '4xl': ['3.052rem', { lineHeight: 'var(--leading-heading)' }],
      '5xl': ['3.815rem', { lineHeight: 'var(--leading-heading)' }],
    },
    extend: {
      colors: {
        bg: {
          primary: token('bg-primary'),
          secondary: token('bg-secondary'),
        },
        surface: {
          DEFAULT: token('surface'),
          elevated: token('surface-elevated'),
        },
        border: {
          DEFAULT: token('border'),
          strong: token('border-strong'),
        },
        accent: {
          primary: token('accent-primary'),
          secondary: token('accent-secondary'),
          on: token('on-accent'),
        },
        text: {
          primary: token('text-primary'),
          secondary: token('text-secondary'),
          muted: token('text-muted'),
        },
        status: {
          success: token('success'),
          warning: token('warning'),
          error: token('error'),
          info: token('info'),
        },
      },
      borderColor: {
        DEFAULT: token('border'),
      },
      fontFamily: {
        body: 'var(--font-body)',
        arabic: 'var(--font-arabic)',
        latin: 'var(--font-latin)',
        mono: 'var(--font-mono)',
      },
      lineHeight: {
        body: 'var(--leading-body)',
        heading: 'var(--leading-heading)',
      },
      maxWidth: {
        layout: 'var(--layout-max-width)',
        prose: 'var(--layout-prose)',
      },
      boxShadow: {
        elevated: 'var(--shadow-elevated)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
    },
  },
  plugins: [],
};
