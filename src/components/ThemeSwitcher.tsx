import { useState, useEffect, useCallback } from 'react';
import { useAtmosphere } from './Atmosphere/useAtmosphere';
import { applySeasonPalette } from './Atmosphere/applySeasonPalette';
import type { Season } from './Atmosphere/types';

const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];
const DARK_MODE_KEY = 'bjnewman-dark-mode';

export function useThemeSwitcher() {
  const { season, setOverride, override } = useAtmosphere();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DARK_MODE_KEY) === 'true';
  });

  // Apply palette whenever season or dark mode changes
  useEffect(() => {
    applySeasonPalette(season, isDark);
    // Clean up any old theme classes
    document.body.classList.remove(
      'theme-brutalist',
      'theme-90s',
      'theme-vaporwave',
      'theme-minimalist',
      'theme-terminal',
    );
  }, [season, isDark]);

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(DARK_MODE_KEY, String(next));
      return next;
    });
  }, []);

  // Provide a seasons list for UI (replaces old themes array)
  const seasons = SEASONS.map((s) => ({
    id: s,
    name: s.charAt(0).toUpperCase() + s.slice(1),
  }));

  return {
    currentSeason: season,
    setSeasonOverride: setOverride,
    override,
    toggleDarkMode,
    isDarkMode: isDark,
    seasons,
  };
}
