/**
 * Client-side language runtime: switches locale without reloading.
 * Each page also has its own URL per language ('/...' Arabic, '/en/...' English);
 * switching rewrites the address and internal page links to match.
 * First paint is handled by LANG_BOOTSTRAP_SCRIPT.
 */
import {
  DIRECTIONS,
  LOCALES,
  LOCALE_STORAGE_KEY,
  isLocale,
  localizePath,
  stripBase,
  type Locale,
} from '@/lib/i18n-config';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Base-free path of an internal page URL, or null for files and other origins. */
function pagePath(url: URL): string | null {
  if (url.origin !== window.location.origin) return null;
  const path = stripBase(url.pathname, import.meta.env.BASE_URL);
  return path.endsWith('/') || path === '/en' ? path : null;
}

/** Point the address bar and every internal page link at the locale's URLs. */
function localizeUrls(locale: Locale): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    if (link.getAttribute('href')?.startsWith('#')) return; // same-page anchors stay relative
    const url = new URL(link.href);
    const path = pagePath(url);
    if (path === null) return;
    const next = BASE + localizePath(path, locale);
    if (next !== url.pathname) link.setAttribute('href', next + url.search + url.hash);
  });

  if (!document.documentElement.hasAttribute('data-localized')) return;
  const here = new URL(window.location.href);
  const path = pagePath(here);
  if (path === null) return;
  const next = BASE + localizePath(path, locale);
  if (next !== here.pathname) {
    window.history.replaceState(window.history.state, '', next + here.search + here.hash);
  }
}

export function currentLocale(): Locale {
  const lang = document.documentElement.getAttribute('lang');
  return isLocale(lang) ? lang : 'ar';
}

function applyAttributes(el: Element, locale: Locale): void {
  for (const name of (el.getAttribute('data-i18n-attrs') ?? '').split(' ').filter(Boolean)) {
    const value = el.getAttribute(`data-i18n-${name}-${locale}`);
    if (value !== null) el.setAttribute(name, value);
  }
}

export function applyLocale(locale: Locale): void {
  const root = document.documentElement;
  root.setAttribute('lang', locale);
  root.setAttribute('dir', DIRECTIONS[locale]);

  const title = document.querySelector<HTMLTitleElement>('title[data-title-ar]');
  const titleText = title?.getAttribute(`data-title-${locale}`);
  if (titleText) document.title = titleText;

  document.querySelectorAll('[data-i18n-attrs]').forEach((el) => applyAttributes(el, locale));
  localizeUrls(locale);
}

export function setLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
  applyLocale(locale);
  document.dispatchEvent(new CustomEvent('localechange', { detail: { locale } }));
}

/** Switch a stateful bilingual label (see statefulLabelAttrs in lib/i18n). */
export function setStatefulLabel(el: Element, state: string): void {
  const names = (el.getAttribute('data-i18n-attrs') ?? '').split(' ').filter(Boolean);
  for (const locale of LOCALES) {
    const value = el.getAttribute(`data-label-${state}-${locale}`);
    if (value === null) continue;
    for (const name of names) el.setAttribute(`data-i18n-${name}-${locale}`, value);
  }
  applyAttributes(el, currentLocale());
}

applyLocale(currentLocale());

document.querySelectorAll<HTMLButtonElement>('[data-language-toggle]').forEach((button) => {
  button.addEventListener('click', () => setLocale(currentLocale() === 'ar' ? 'en' : 'ar'));
});

// Keep other open tabs in sync.
window.addEventListener('storage', (event) => {
  if (event.key === LOCALE_STORAGE_KEY && isLocale(event.newValue)) applyLocale(event.newValue);
});
