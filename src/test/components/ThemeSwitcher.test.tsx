import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeSwitcher } from '../../components/ThemeSwitcher';

describe('useThemeSwitcher - Dark Mode Toggle', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document styles
    document.documentElement.style.cssText = '';
    document.body.style.cssText = '';
    document.body.className = '';
  });

  it('should initialize with professional theme by default', () => {
    const { result } = renderHook(() => useThemeSwitcher());
    expect(result.current.currentTheme.id).toBe('professional');
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should toggle from light theme to dark mode', () => {
    const { result } = renderHook(() => useThemeSwitcher());

    // Start on professional (light)
    expect(result.current.currentTheme.id).toBe('professional');
    expect(result.current.isDarkMode).toBe(false);

    // Toggle to dark
    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.currentTheme.id).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should toggle from dark mode back to the previous light theme', () => {
    const { result } = renderHook(() => useThemeSwitcher());

    // Start on professional
    expect(result.current.currentTheme.id).toBe('professional');

    // Toggle to dark
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.currentTheme.id).toBe('dark');

    // Toggle back - should return to professional
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.currentTheme.id).toBe('professional');
  });

  it('should remember the light theme when toggling from a non-default theme', () => {
    const { result } = renderHook(() => useThemeSwitcher());

    // Switch to ocean theme via secret menu
    act(() => {
      result.current.switchTheme('ocean');
    });
    expect(result.current.currentTheme.id).toBe('ocean');

    // Toggle to dark
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.currentTheme.id).toBe('dark');

    // Toggle back - should return to ocean, NOT professional
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.currentTheme.id).toBe('ocean');
  });

  it('should remember theme across different hook instances (multi-component scenario)', () => {
    // Simulates real app: SecretFeatures and ThemeToggle use separate hook instances
    const { result: secretMenuHook } = renderHook(() => useThemeSwitcher());
    const { result: toggleHook } = renderHook(() => useThemeSwitcher());

    // User changes theme via secret menu
    act(() => {
      secretMenuHook.current.switchTheme('ocean');
    });
    expect(localStorage.getItem('bjnewman-theme')).toBe('ocean');

    // User clicks toggle button (different component)
    act(() => {
      toggleHook.current.toggleDarkMode();
    });
    expect(localStorage.getItem('bjnewman-theme')).toBe('dark');

    // User clicks toggle again - should return to ocean
    act(() => {
      toggleHook.current.toggleDarkMode();
    });
    expect(localStorage.getItem('bjnewman-theme')).toBe('ocean');
  });

  it('should NOT be affected by secret menu theme changes while in dark mode', () => {
    const { result } = renderHook(() => useThemeSwitcher());

    // Start on professional, toggle to dark
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.currentTheme.id).toBe('dark');

    // Toggle back to light - should be professional
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.currentTheme.id).toBe('professional');
  });

  it('should use current light theme as "previous" when loading fresh (not in dark mode)', () => {
    // Simulate stale localStorage from a previous session
    localStorage.setItem('bjnewman-theme', 'ocean');
    localStorage.setItem('bjnewman-previous-theme', '90s'); // Stale data!

    const { result } = renderHook(() => useThemeSwitcher());

    // Should load ocean theme
    expect(result.current.currentTheme.id).toBe('ocean');

    // Toggle to dark
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.currentTheme.id).toBe('dark');

    // Toggle back - should return to OCEAN (current theme), NOT 90s (stale data)
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.currentTheme.id).toBe('ocean');
  });

  it('should go to professional (default) when toggling from dark after page reload', () => {
    // User was in dark mode when they reloaded the page
    localStorage.setItem('bjnewman-theme', 'dark');

    const { result } = renderHook(() => useThemeSwitcher());
    expect(result.current.currentTheme.id).toBe('dark');

    // Toggle back - should go to professional (the default), not any previous theme
    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.currentTheme.id).toBe('professional');
  });

  it('should clean up stale localStorage keys from previous implementation', () => {
    // Set up stale data from old implementation
    localStorage.setItem('bjnewman-theme', 'forest');
    localStorage.setItem('bjnewman-previous-theme', '90s');

    // Load the hook
    renderHook(() => useThemeSwitcher());

    // Stale previous-theme key should be removed
    expect(localStorage.getItem('bjnewman-previous-theme')).toBeNull();
  });
});
