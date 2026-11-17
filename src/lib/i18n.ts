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
 * Labels that depend on UI state (menu open/closed, theme mode) in every locale.
 * Renders data-label-<state>-<locale> plus the initial state's i18n attributes;
 * the client switches state with setStatefulLabel().
 */
export function statefulLabelAttrs(
  states: Record<string, TranslationKey>,
  initial: string,
  attrNames: string[] = ['aria-label'],
): Record<string, string> {
  const initialKey = states[initial];
  if (!initialKey) throw new Error(`Unknown initial label state "${initial}"`);
  const result = i18nAttrs(Object.fromEntries(attrNames.map((name) => [name, initialKey])));
  for (const [state, key] of Object.entries(states)) {
    for (const locale of LOCALES) result[`data-label-${state}-${locale}`] = t(locale, key);
  }
  return result;
}

/**
 * Blocking inline script for <head>, before first paint.
 * Localized pages (<html data-localized>) are served per language: '/...' Arabic,
 * '/en/...' English. A stored explicit choice that differs from the page switches
 * the language and rewrites the address to the matching URL (no reload).
 * Crawlers have no stored choice, so they always get the language of the URL.
 * Non-localized pages (404) use the stored choice, else the path prefix.
 */
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');
export const LANG_BOOTSTRAP_SCRIPT = `(function(){var d=document.documentElement,B=${JSON.stringify(
  BASE_PATH,
)},p=location.pathname,r=B&&p.indexOf(B)===0?p.slice(B.length):p,u=r==="/en"||r.indexOf("/en/")===0,l;try{l=localStorage.getItem(${JSON.stringify(
  LOCALE_STORAGE_KEY,
)})}catch(e){}if(!d.hasAttribute("data-localized")){if(l!=="ar"&&l!=="en")l=u?"en":"ar"}else{if((l!=="ar"&&l!=="en")||l===d.getAttribute("lang"))return;try{history.replaceState(history.state,"",B+(l==="en"?"/en"+r:r.slice(3)||"/")+location.search+location.hash)}catch(e){}}d.setAttribute("lang",l);d.setAttribute("dir",l==="ar"?"rtl":"ltr")})();`;
