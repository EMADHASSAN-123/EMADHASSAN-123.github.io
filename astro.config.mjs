// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// Canonical site URL is required by the sitemap integration.
// It is injected at build time (CI secret or local .env); never hardcoded.
const site = env.PUBLIC_SITE_URL || undefined;

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    tailwind({
      // Base styles are imported explicitly from src/styles/global.css.
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
});
