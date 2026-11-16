/** Site-wide configuration and URL helpers. */

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
