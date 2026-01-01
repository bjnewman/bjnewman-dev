import { useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    bgGradient: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'professional',
    name: 'Professional',
    emoji: '💼',
    colors: {
      primary: '#6366f1',
      primaryLight: '#818cf8',
      primaryDark: '#4f46e5',
      accent: '#ec4899',
      accentLight: '#f472b6',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      bgGradient: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #fce7f3 100%)',
    },
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    emoji: '🌅',
    colors: {
      primary: '#f97316',
      primaryLight: '#fb923c',
      primaryDark: '#ea580c',
      accent: '#f59e0b',
      accentLight: '#fbbf24',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Depth',
    emoji: '🌊',
    colors: {
      primary: '#0ea5e9',
      primaryLight: '#38bdf8',
      primaryDark: '#0284c7',
      accent: '#06b6d4',
      accentLight: '#22d3ee',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #ddd6fe 100%)',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    colors: {
      primary: '#10b981',
      primaryLight: '#34d399',
      primaryDark: '#059669',
      accent: '#14b8a6',
      accentLight: '#2dd4bf',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      textMuted: '#94a3b8',
      bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #bfdbfe 100%)',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    emoji: '🌙',
    colors: {
      primary: '#818cf8',
      primaryLight: '#a5b4fc',
      primaryDark: '#6366f1',
      accent: '#f472b6',
      accentLight: '#f9a8d4',
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    },
  },
  {
    id: 'pastel',
    name: 'Pastel Dream',
    emoji: '🎨',
    colors: {
      primary: '#E6D1FF',
      primaryLight: '#F5E6FF',
      primaryDark: '#D1B3FF',
      accent: '#FFD1DC',
      accentLight: '#FFE6ED',
      textPrimary: '#4A4A4A',
      textSecondary: '#757575',
      textMuted: '#999999',
      bgGradient: 'linear-gradient(135deg, #BFDFFF 0%, #FFD1DC 100%)',
    },
  },
];

const THEME_STORAGE_KEY = 'bjnewman-theme';

export const useThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    // Load saved theme on mount
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedThemeId) {
      const savedTheme = themes.find(t => t.id === savedThemeId);
      if (savedTheme) {
        applyTheme(savedTheme);
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    const { colors } = theme;

    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-light', colors.primaryLight);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-light', colors.accentLight);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);

    // Update background gradient
    document.body.style.background = colors.bgGradient;
    document.body.style.backgroundAttachment = 'fixed';

    // Update special background colors for dark mode
    if (theme.id === 'dark') {
      root.style.setProperty('--bg-primary', '#1e293b');
      root.style.setProperty('--bg-secondary', '#334155');
      root.style.setProperty('--bg-tertiary', '#475569');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#f1f5f9');
    }
  };

  const switchTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      applyTheme(theme);
      setCurrentTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  };

  return { currentTheme, switchTheme, themes };
};
