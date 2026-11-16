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
