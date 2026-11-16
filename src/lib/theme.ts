/**
 * Theme system: Auto / Dark / Light.
 *
 * Resolution order: stored preference > prefers-color-scheme > dark.
 * The resolved theme is written to <html data-theme="dark|light"> and the
 * user's choice to <html data-theme-preference="auto|dark|light">.
 */

export const THEME_STORAGE_KEY = 'theme';

export const THEME_PREFERENCES = ['auto', 'dark', 'light'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = Exclude<ThemePreference, 'auto'>;

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'auto';
export const FALLBACK_THEME: ResolvedTheme = 'dark';

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value);
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersLight: boolean,
): ResolvedTheme {
  if (preference === 'auto') return systemPrefersLight ? 'light' : FALLBACK_THEME;
  return preference;
}

/**
 * Blocking inline script for <head>: applies the theme before first paint
 * to prevent a flash of the wrong theme. Kept dependency-free and minimal;
 * its hash must be allowed in the CSP script-src once CSP is added.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){var p;try{p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})}catch(e){}if(p!=="dark"&&p!=="light")p="auto";var r=p==="auto"?(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):p;var d=document.documentElement;d.setAttribute("data-theme",r);d.setAttribute("data-theme-preference",p);})();`;
