import type { Season } from './types';
import { seasonPalettes, darkModeOverrides } from './seasonPalettes';

export function applySeasonPalette(season: Season, isDark: boolean = false) {
  const palette = { ...seasonPalettes[season] };
  if (isDark) {
    Object.assign(palette, darkModeOverrides);
    palette.bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)';
  }

  const root = document.documentElement;
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-light', palette.primaryLight);
  root.style.setProperty('--primary-dark', palette.primaryDark);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-light', palette.accentLight);
  root.style.setProperty('--text-primary', palette.textPrimary);
  root.style.setProperty('--text-secondary', palette.textSecondary);
  root.style.setProperty('--text-muted', palette.textMuted);
  root.style.setProperty('--bg-primary', palette.bgPrimary);
  root.style.setProperty('--bg-secondary', palette.bgSecondary);
  root.style.setProperty('--bg-tertiary', palette.bgTertiary);

  document.body.style.background = palette.bgGradient;
  document.body.style.backgroundAttachment = 'fixed';
}
