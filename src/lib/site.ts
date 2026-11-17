/** Site-wide configuration and URL helpers. */
import { localeOfPath, localizePath, stripBase, type Locale } from '@/lib/i18n-config';

/**
 * CV download path (relative to the site root), e.g. '/cv/<file>.pdf'.
 * TODO: cv-file — set once the CV PDF is added to public/cv/.
 */
export const CV_PATH: string | null = null;

/** Prefix a root-relative path with the configured base (GitHub Pages project sites). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Locale of the page being rendered, from its URL ('/en/...' is English). */
export function pageLocale(url: URL): Locale {
  return localeOfPath(stripBase(url.pathname, import.meta.env.BASE_URL));
}

/**
 * Link to a site page in the language of the current page, e.g. '/#projects'
 * becomes '/en/#projects' on English pages. Use withBase() for files (PDFs, images).
 */
export function pageHref(url: URL, path: string, locale: Locale = pageLocale(url)): string {
  return withBase(localizePath(path, locale));
}

/**
 * Direct contact channels (PROJECT_CONTEXT section 9.3), supplied by the owner.
 * The phone number is Yemeni (+967), matching the documented location.
 */
export const CONTACT = {
  phoneE164: '+967773568667',
  phoneDisplay: '+967 773 568 667',
  whatsappUrl: 'https://wa.me/967773568667',
  linkedinUrl: 'https://www.linkedin.com/in/emad-hassan-14262b2b2',
  facebookUrl: 'https://www.facebook.com/share/1BzwNq4Nfh/',
  email: 'emadaali62@gmail.com' as string | null,
} as const;
