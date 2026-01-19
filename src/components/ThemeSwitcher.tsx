import { useState, useEffect, useRef } from 'react';

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  className?: string; // Optional CSS class for radical theme transformations
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
  {
    id: 'brutalist',
    name: 'Brutalist',
    emoji: '🔲',
    className: 'theme-brutalist',
    colors: {
      primary: '#000000',
      primaryLight: '#333333',
      primaryDark: '#000000',
      accent: '#ff0000',
      accentLight: '#ff3333',
      textPrimary: '#000000',
      textSecondary: '#333333',
      textMuted: '#666666',
      bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    },
  },
  {
    id: '90s',
    name: '90s Geocities',
    emoji: '💾',
    className: 'theme-90s',
    colors: {
      primary: '#00ff00',
      primaryLight: '#66ff66',
      primaryDark: '#00cc00',
      accent: '#ff00ff',
      accentLight: '#ff66ff',
      textPrimary: '#0000ff',
      textSecondary: '#ff00ff',
      textMuted: '#00ffff',
      bgGradient: 'linear-gradient(135deg, #ffff00 0%, #ff00ff 50%, #00ffff 100%)',
    },
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    emoji: '🌴',
    className: 'theme-vaporwave',
    colors: {
      primary: '#ff71ce',
      primaryLight: '#ff8fd8',
      primaryDark: '#ff53c4',
      accent: '#01cdfe',
      accentLight: '#33d7fe',
      textPrimary: '#ffffff',
      textSecondary: '#b967ff',
      textMuted: '#05ffa1',
      bgGradient: 'linear-gradient(180deg, #2d1b69 0%, #5b2a86 50%, #ff71ce 100%)',
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    emoji: '⬜',
    className: 'theme-minimalist',
    colors: {
      primary: '#1a1a1a',
      primaryLight: '#4a4a4a',
      primaryDark: '#000000',
      accent: '#666666',
      accentLight: '#999999',
      textPrimary: '#333333',
      textSecondary: '#666666',
      textMuted: '#999999',
      bgGradient: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
    },
  },
  {
    id: 'terminal',
    name: 'Hacker Terminal',
    emoji: '💻',
    className: 'theme-terminal',
    colors: {
      primary: '#00ff00',
      primaryLight: '#33ff33',
      primaryDark: '#00cc00',
      accent: '#00aa00',
      accentLight: '#00dd00',
      textPrimary: '#00ff00',
      textSecondary: '#00cc00',
      textMuted: '#008800',
      bgGradient: 'linear-gradient(135deg, #000000 0%, #001100 100%)',
    },
  },
  {
    id: 'legal-pad',
    name: 'Legal Pad',
    emoji: '📝',
    className: 'theme-legal-pad',
    colors: {
      primary: '#4a5568',
      primaryLight: '#718096',
      primaryDark: '#2d3748',
      accent: '#c53030',
      accentLight: '#e53e3e',
      textPrimary: '#1a202c',
      textSecondary: '#4a5568',
      textMuted: '#718096',
      bgGradient: 'linear-gradient(180deg, #5d4e37 0%, #4a3f2f 100%)', // Desk color (overridden by CSS)
    },
  },
];

const THEME_STORAGE_KEY = 'bjnewman-theme';

export const useThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  // Use a ref to track the previous light theme - refs don't have closure issues
  const previousLightThemeRef = useRef<string>('professional');

  useEffect(() => {
    // Clean up stale localStorage key from previous implementation
    localStorage.removeItem('bjnewman-previous-theme');

    // Load saved theme on mount
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedThemeId) {
      const savedTheme = themes.find((t) => t.id === savedThemeId);
      if (savedTheme) {
        applyTheme(savedTheme);
        setCurrentTheme(savedTheme);

        // If we're on a light theme, remember it for the toggle
        if (savedThemeId !== 'dark') {
          previousLightThemeRef.current = savedThemeId;
        }
      }
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    const { colors } = theme;

    // Apply CSS custom properties (including background gradient)
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-light', colors.primaryLight);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-light', colors.accentLight);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--bg-gradient', colors.bgGradient);

    // Clear any inline background styles (let CSS handle it via --bg-gradient)
    document.body.style.background = '';
    document.body.style.backgroundAttachment = '';

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

    // Handle theme class name for radical theme transformations
    // Remove all existing theme classes
    themes.forEach((t) => {
      if (t.className) {
        document.body.classList.remove(t.className);
      }
    });

    // Add new theme class if present
    if (theme.className) {
      document.body.classList.add(theme.className);
    }
  };

  const switchTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      applyTheme(theme);
      setCurrentTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  };

  const toggleDarkMode = () => {
    // Read current theme directly from localStorage to avoid stale state issues
    const currentThemeId = localStorage.getItem(THEME_STORAGE_KEY) || 'professional';

    if (currentThemeId === 'dark') {
      // Switch back to previous light theme
      switchTheme(previousLightThemeRef.current);
    } else {
      // Remember current theme and switch to dark
      previousLightThemeRef.current = currentThemeId;
      switchTheme('dark');
    }
  };

  const isDarkMode = currentTheme.id === 'dark';

  return { currentTheme, switchTheme, toggleDarkMode, isDarkMode, themes };
};
