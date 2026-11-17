// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// Canonical origin of the published site (GitHub Pages user site).
// Required for canonical URLs, Open Graph URLs and the sitemap.
// PUBLIC_SITE_URL can override it (e.g. for a preview build).
const site = env.PUBLIC_SITE_URL || 'https://emadhassan-123.github.io';

export default defineConfig({
  site,
  output: 'static',
  // GitHub Pages serves directory pages at '/path/'; links must match to avoid 301s.
  trailingSlash: 'always',
  integrations: [
    tailwind({
      // Base styles are imported explicitly from src/styles/global.css.
      applyBaseStyles: false,
    }),
    sitemap({
      // The 404 page must never be listed.
      filter: (page) => !page.includes('/404'),
      // Arabic at '/path/', English at '/en/path/': list both with hreflang alternates.
      i18n: { defaultLocale: 'ar', locales: { ar: 'ar', en: 'en' } },
    }),
  ],
  vite: {
    build: {
      // Keep every script as an external file so the CSP can stay at script-src 'self'
      // (the only inline script is the theme/lang bootstrap, allowed by hash).
      assetsInlineLimit: 0,
    },
  },
});
