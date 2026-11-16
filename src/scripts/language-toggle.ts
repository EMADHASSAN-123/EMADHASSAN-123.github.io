/**
 * Client-side language runtime: applies a locale without reloading.
 * The toggle button is wired here in a later step; for now this keeps
 * translated attributes and the document title in sync with <html lang>.
 */
import { DIRECTIONS, LOCALE_STORAGE_KEY, isLocale, type Locale } from '@/lib/i18n-config';

export function currentLocale(): Locale {
  const lang = document.documentElement.getAttribute('lang');
  return isLocale(lang) ? lang : 'ar';
}

export function applyLocale(locale: Locale): void {
  const root = document.documentElement;
  root.setAttribute('lang', locale);
  root.setAttribute('dir', DIRECTIONS[locale]);

  const title = document.querySelector<HTMLTitleElement>('title[data-title-ar]');
  const titleText = title?.dataset[locale === 'ar' ? 'titleAr' : 'titleEn'];
  if (titleText) document.title = titleText;

  document.querySelectorAll<HTMLElement>('[data-i18n-attrs]').forEach((el) => {
    for (const name of (el.dataset.i18nAttrs ?? '').split(' ').filter(Boolean)) {
      const value = el.getAttribute(`data-i18n-${name}-${locale}`);
      if (value !== null) el.setAttribute(name, value);
    }
  });
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

applyLocale(currentLocale());
