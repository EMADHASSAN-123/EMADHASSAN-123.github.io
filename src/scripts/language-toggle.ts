/**
 * Client-side language runtime: switches locale without reloading.
 * Order on first visit (see LANG_BOOTSTRAP_SCRIPT): stored choice >
 * browser languages > Arabic.
 */
import { DIRECTIONS, LOCALES, LOCALE_STORAGE_KEY, isLocale, type Locale } from '@/lib/i18n-config';

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
