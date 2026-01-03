import { Sun, Moon } from 'lucide-react';
import { useThemeSwitcher } from './ThemeSwitcher';
import './ThemeToggle.css';

export const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useThemeSwitcher();

  return (
    <button
      className="theme-toggle"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`theme-toggle-icon ${isDarkMode ? 'hidden' : 'visible'}`}>
        <Moon size={20} aria-hidden="true" />
      </span>
      <span className={`theme-toggle-icon ${isDarkMode ? 'visible' : 'hidden'}`}>
        <Sun size={20} aria-hidden="true" />
      </span>
    </button>
  );
};

export default ThemeToggle;
