import type { GetStaticPaths } from 'astro';

/**
 * Every content page is built twice: '/path/' (Arabic, default) and
 * '/en/path/' (English). Both versions carry both languages so switching
 * stays instant; the URL decides which one shows first and gets indexed.
 */
export const localeStaticPaths = (() => [
  { params: { lang: undefined } },
  { params: { lang: 'en' } },
]) satisfies GetStaticPaths;
