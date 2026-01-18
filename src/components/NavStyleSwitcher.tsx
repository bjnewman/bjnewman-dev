import { useState, useEffect } from 'react';

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

const NAV_STYLE_STORAGE_KEY = 'bjnewman-nav-style';
const NAV_STYLE_OVERRIDE_KEY = 'bjnewman-nav-style-override';

export const useNavStyleSwitcher = () => {
  const [currentNavStyle, setCurrentNavStyle] = useState<NavStyle>(navStyles[0]);
  const [isOverridden, setIsOverridden] = useState(false);

  useEffect(() => {
    // Load saved nav style on mount
    const savedNavStyleId = localStorage.getItem(NAV_STYLE_STORAGE_KEY);
    const hasOverride = localStorage.getItem(NAV_STYLE_OVERRIDE_KEY) === 'true';

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
      localStorage.setItem(NAV_STYLE_STORAGE_KEY, navStyleId);

      if (isUserOverride) {
        setIsOverridden(true);
        localStorage.setItem(NAV_STYLE_OVERRIDE_KEY, 'true');
      }
    }
  };

  const setNavStyleFromTheme = (themeId: string) => {
    // Only update if user hasn't manually overridden
    const hasOverride = localStorage.getItem(NAV_STYLE_OVERRIDE_KEY) === 'true';
    if (hasOverride) return;

    const defaultNavStyleId = themeNavDefaults[themeId] || 'filing-tabs';
    const navStyle = navStyles.find((n) => n.id === defaultNavStyleId);
    if (navStyle) {
      applyNavStyle(navStyle);
      setCurrentNavStyle(navStyle);
      localStorage.setItem(NAV_STYLE_STORAGE_KEY, defaultNavStyleId);
    }
  };

  const resetToThemeDefault = (currentThemeId: string) => {
    // Clear the override flag
    localStorage.removeItem(NAV_STYLE_OVERRIDE_KEY);
    setIsOverridden(false);

    // Apply the default nav style for the current theme
    const defaultNavStyleId = themeNavDefaults[currentThemeId] || 'filing-tabs';
    const navStyle = navStyles.find((n) => n.id === defaultNavStyleId);
    if (navStyle) {
      applyNavStyle(navStyle);
      setCurrentNavStyle(navStyle);
      localStorage.setItem(NAV_STYLE_STORAGE_KEY, defaultNavStyleId);
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
