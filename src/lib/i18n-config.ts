/**
 * Locale constants shared by build-time code and client scripts.
 * Kept free of dictionary imports so client bundles stay small.
 */
export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ar';
export const LOCALE_STORAGE_KEY = 'lang';
export const DIRECTIONS: Record<Locale, 'rtl' | 'ltr'> = { ar: 'rtl', en: 'ltr' };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Locales served under their own URL prefix (the default locale has none). */
export const PREFIXED_LOCALE: Locale = 'en';

/** Strip the deploy base, e.g. '/repo/en/x/' -> '/en/x/'. */
export function stripBase(pathname: string, base: string): string {
  const b = base.replace(/\/$/, '');
  return b && pathname.startsWith(b) ? pathname.slice(b.length) || '/' : pathname;
}

/** Locale of a base-free path: '/en/...' is English, everything else Arabic. */
export function localeOfPath(path: string): Locale {
  return path === `/${PREFIXED_LOCALE}` || path.startsWith(`/${PREFIXED_LOCALE}/`)
    ? PREFIXED_LOCALE
    : DEFAULT_LOCALE;
}

/** Same base-free path in another locale: '/projects/x/' <-> '/en/projects/x/'. */
export function localizePath(path: string, locale: Locale): string {
  const neutral =
    localeOfPath(path) === PREFIXED_LOCALE ? path.slice(PREFIXED_LOCALE.length + 1) || '/' : path;
  return locale === PREFIXED_LOCALE
    ? `/${PREFIXED_LOCALE}${neutral.startsWith('/') ? neutral : `/${neutral}`}`
    : neutral;
}
