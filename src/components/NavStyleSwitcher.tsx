import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/storage';

export interface NavStyle {
  id: string;
  name: string;
  emoji: string;
  className: string;
}

export const navStyles: NavStyle[] = [
  {
    id: 'filing-tabs',
    name: 'Filing Tabs',
    emoji: '📁',
    className: 'nav-filing-tabs',
  },
  {
    id: 'index-cards',
    name: 'Index Cards',
    emoji: '🗂️',
    className: 'nav-index-cards',
  },
  {
    id: 'cli-prompt',
    name: 'CLI Prompt',
    emoji: '💻',
    className: 'nav-cli-prompt',
  },
  {
    id: 'neon-float',
    name: 'Neon Float',
    emoji: '✨',
    className: 'nav-neon-float',
  },
  {
    id: 'win95',
    name: 'Win95 Buttons',
    emoji: '🪟',
    className: 'nav-win95',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '➖',
    className: 'nav-minimal',
  },
];

// Theme to nav style default mappings
export const themeNavDefaults: Record<string, string> = {
  professional: 'filing-tabs',
  sunset: 'filing-tabs',
  ocean: 'filing-tabs',
  forest: 'filing-tabs',
  dark: 'filing-tabs',
  pastel: 'filing-tabs',
  brutalist: 'index-cards',
  terminal: 'cli-prompt',
  vaporwave: 'neon-float',
  '90s': 'win95',
  minimalist: 'minimal',
};


export const useNavStyleSwitcher = () => {
  const [currentNavStyle, setCurrentNavStyle] = useState<NavStyle>(navStyles[0]);
  const [isOverridden, setIsOverridden] = useState(false);

  useEffect(() => {
    // Load saved nav style on mount
    const savedNavStyleId = localStorage.getItem(STORAGE_KEYS.NAV_STYLE);
    const hasOverride = localStorage.getItem(STORAGE_KEYS.NAV_STYLE_OVERRIDE) === 'true';

    if (savedNavStyleId) {
      const savedNavStyle = navStyles.find((n) => n.id === savedNavStyleId);
      if (savedNavStyle) {
        applyNavStyle(savedNavStyle);
        setCurrentNavStyle(savedNavStyle);
        setIsOverridden(hasOverride);
      }
    }
  }, []);

  const applyNavStyle = (navStyle: NavStyle) => {
    const nav = document.querySelector('.site-nav');
    if (nav) {
      // Remove all nav style classes
      navStyles.forEach((style) => {
        nav.classList.remove(style.className);
      });
      // Add the new nav style class
      nav.classList.add(navStyle.className);
    }
  };

  const switchNavStyle = (navStyleId: string, isUserOverride = true) => {
    const navStyle = navStyles.find((n) => n.id === navStyleId);
    if (navStyle) {
      applyNavStyle(navStyle);
      setCurrentNavStyle(navStyle);
      localStorage.setItem(STORAGE_KEYS.NAV_STYLE, navStyleId);

      if (isUserOverride) {
        setIsOverridden(true);
        localStorage.setItem(STORAGE_KEYS.NAV_STYLE_OVERRIDE, 'true');
      }
    }
  };

  const setNavStyleFromTheme = (themeId: string) => {
    // Only update if user hasn't manually overridden
    const hasOverride = localStorage.getItem(STORAGE_KEYS.NAV_STYLE_OVERRIDE) === 'true';
    if (hasOverride) return;

    const defaultNavStyleId = themeNavDefaults[themeId] || 'filing-tabs';
    const navStyle = navStyles.find((n) => n.id === defaultNavStyleId);
    if (navStyle) {
      applyNavStyle(navStyle);
      setCurrentNavStyle(navStyle);
      localStorage.setItem(STORAGE_KEYS.NAV_STYLE, defaultNavStyleId);
    }
  };

  const resetToThemeDefault = (currentThemeId: string) => {
    // Clear the override flag
    localStorage.removeItem(STORAGE_KEYS.NAV_STYLE_OVERRIDE);
    setIsOverridden(false);

    // Apply the default nav style for the current theme
    const defaultNavStyleId = themeNavDefaults[currentThemeId] || 'filing-tabs';
    const navStyle = navStyles.find((n) => n.id === defaultNavStyleId);
    if (navStyle) {
      applyNavStyle(navStyle);
      setCurrentNavStyle(navStyle);
      localStorage.setItem(STORAGE_KEYS.NAV_STYLE, defaultNavStyleId);
    }
  };

  return {
    currentNavStyle,
    switchNavStyle,
    setNavStyleFromTheme,
    resetToThemeDefault,
    isOverridden,
    navStyles,
  };
};
