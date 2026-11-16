/**
 * Theme switcher: cycles Auto → Dark → Light.
 * The first paint is handled by THEME_BOOTSTRAP_SCRIPT; this script only
 * reacts to user actions, system changes and other tabs.
 */
import {
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
  type ThemePreference,
} from '@/lib/theme';
import { setStatefulLabel } from '@/scripts/language-toggle';

const root = document.documentElement;
const systemLight = window.matchMedia('(prefers-color-scheme: light)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');

function currentPreference(): ThemePreference {
  const value = root.getAttribute('data-theme-preference');
  return isThemePreference(value) ? value : 'auto';
}

function apply(preference: ThemePreference, animate: boolean): void {
  const resolved = resolveTheme(preference, systemLight.matches);
  const withTransition = animate && !reducedMotion.matches && root.dataset.theme !== resolved;

  if (withTransition) root.classList.add('theme-transition');
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-theme-preference', preference);
  buttons.forEach((button) => setStatefulLabel(button, preference));

  if (withTransition) {
    window.setTimeout(() => root.classList.remove('theme-transition'), 250);
  }
}

function store(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage unavailable: the choice lasts for this page only.
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const index = THEME_PREFERENCES.indexOf(currentPreference());
    const next = THEME_PREFERENCES[(index + 1) % THEME_PREFERENCES.length] ?? 'auto';
    store(next);
    apply(next, true);
  });
});

systemLight.addEventListener('change', () => {
  if (currentPreference() === 'auto') apply('auto', true);
});

window.addEventListener('storage', (event) => {
  if (event.key === THEME_STORAGE_KEY) {
    apply(isThemePreference(event.newValue) ? event.newValue : 'auto', true);
  }
});

// Sync button labels with the preference resolved before first paint.
apply(currentPreference(), false);
