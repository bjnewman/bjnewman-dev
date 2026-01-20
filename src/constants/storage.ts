/**
 * localStorage keys used across the site.
 * Keep in sync with Base.astro inline script (which can't import modules).
 */
export const STORAGE_KEYS = {
  THEME: 'bjnewman-theme',
  NAV_STYLE: 'bjnewman-nav-style',
  NAV_STYLE_OVERRIDE: 'bjnewman-nav-style-override',
} as const;
