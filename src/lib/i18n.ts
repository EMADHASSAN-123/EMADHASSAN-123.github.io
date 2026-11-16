/**
 * Lightweight i18n (PHASE3_ARCH section 2).
 *
 * Both languages are rendered into the static HTML; CSS hides the inactive
 * one based on <html lang>. Switching only changes lang/dir — no reload.
 * Keys use dot notation and are type-checked against ar.json.
 */
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import { DEFAULT_LOCALE, LOCALES, LOCALE_STORAGE_KEY, type Locale } from '@/lib/i18n-config';

export * from '@/lib/i18n-config';

type Dictionary = typeof ar;

// `satisfies` fails the type check if en.json is missing any key of ar.json.
const dictionaries: Record<Locale, Dictionary> = { ar, en: en satisfies Dictionary };

type LeafKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : LeafKeys<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = LeafKeys<Dictionary>;
export type Translations = Record<Locale, string>;

export function t(locale: Locale, key: TranslationKey): string {
  const value = key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node !== null && typeof node === 'object'
          ? (node as Record<string, unknown>)[part]
          : undefined,
      dictionaries[locale],
    );
  if (typeof value !== 'string') {
    throw new Error(`Missing translation "${key}" for locale "${locale}"`);
  }
  return value;
}

export function translations(key: TranslationKey): Translations {
  return { ar: t('ar', key), en: t('en', key) };
}

/**
 * Bilingual HTML attributes (aria-label, title, ...). The default-locale value
 * is rendered; the runtime swaps it from data-i18n-<attr>-<locale> on switch.
 */
export function i18nAttrs(attrs: Record<string, TranslationKey>): Record<string, string> {
  const result: Record<string, string> = { 'data-i18n-attrs': Object.keys(attrs).join(' ') };
  for (const [name, key] of Object.entries(attrs)) {
    result[name] = t(DEFAULT_LOCALE, key);
    for (const locale of LOCALES) result[`data-i18n-${name}-${locale}`] = t(locale, key);
  }
  return result;
}

/**
 * Blocking inline script for <head>: sets lang/dir before first paint.
 * Order: stored choice > browser languages (Accept-Language) > Arabic.
 */
export const LANG_BOOTSTRAP_SCRIPT = `(function(){var l;try{l=localStorage.getItem(${JSON.stringify(
  LOCALE_STORAGE_KEY,
)})}catch(e){}if(l!=="ar"&&l!=="en"){l="ar";var n=navigator.languages||[navigator.language||""];for(var i=0;i<n.length;i++){var c=String(n[i]).toLowerCase().slice(0,2);if(c==="ar"||c==="en"){l=c;break}}}var d=document.documentElement;d.setAttribute("lang",l);d.setAttribute("dir",l==="ar"?"rtl":"ltr");})();`;
