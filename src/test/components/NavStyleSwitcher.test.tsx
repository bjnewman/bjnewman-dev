import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useNavStyleSwitcher,
  navStyles,
  themeNavDefaults,
} from '../../components/NavStyleSwitcher';

describe('useNavStyleSwitcher', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Create mock nav element
    document.body.innerHTML = '<nav class="site-nav nav-filing-tabs"></nav>';
  });

  it('should initialize with filing-tabs style by default', () => {
    const { result } = renderHook(() => useNavStyleSwitcher());
    expect(result.current.currentNavStyle.id).toBe('filing-tabs');
    expect(result.current.isOverridden).toBe(false);
  });

  it('should have 6 nav styles defined', () => {
    expect(navStyles).toHaveLength(6);
    expect(navStyles.map((s) => s.id)).toEqual([
      'filing-tabs',
      'index-cards',
      'cli-prompt',
      'neon-float',
      'win95',
      'minimal',
    ]);
  });

  it('should switch nav style and save to localStorage', () => {
    const { result } = renderHook(() => useNavStyleSwitcher());

    act(() => {
      result.current.switchNavStyle('cli-prompt');
    });

    expect(result.current.currentNavStyle.id).toBe('cli-prompt');
    expect(localStorage.getItem('bjnewman-nav-style')).toBe('cli-prompt');
    expect(localStorage.getItem('bjnewman-nav-style-override')).toBe('true');
    expect(result.current.isOverridden).toBe(true);
  });

  it('should apply nav style class to the nav element', () => {
    const { result } = renderHook(() => useNavStyleSwitcher());
    const nav = document.querySelector('.site-nav');

    act(() => {
      result.current.switchNavStyle('neon-float');
    });

    expect(nav?.classList.contains('nav-neon-float')).toBe(true);
    expect(nav?.classList.contains('nav-filing-tabs')).toBe(false);
  });

  it('should load saved nav style from localStorage', () => {
    localStorage.setItem('bjnewman-nav-style', 'win95');
    localStorage.setItem('bjnewman-nav-style-override', 'true');

    const { result } = renderHook(() => useNavStyleSwitcher());

    expect(result.current.currentNavStyle.id).toBe('win95');
    expect(result.current.isOverridden).toBe(true);
  });

  describe('theme integration', () => {
    it('should have correct default nav styles for each theme', () => {
      expect(themeNavDefaults['professional']).toBe('filing-tabs');
      expect(themeNavDefaults['brutalist']).toBe('index-cards');
      expect(themeNavDefaults['terminal']).toBe('cli-prompt');
      expect(themeNavDefaults['vaporwave']).toBe('neon-float');
      expect(themeNavDefaults['90s']).toBe('win95');
      expect(themeNavDefaults['minimalist']).toBe('minimal');
    });

    it('should update nav style when theme changes (no override)', () => {
      const { result } = renderHook(() => useNavStyleSwitcher());

      act(() => {
        result.current.setNavStyleFromTheme('terminal');
      });

      expect(result.current.currentNavStyle.id).toBe('cli-prompt');
    });

    it('should NOT update nav style when theme changes if user has override', () => {
      localStorage.setItem('bjnewman-nav-style-override', 'true');
      localStorage.setItem('bjnewman-nav-style', 'neon-float');

      const { result } = renderHook(() => useNavStyleSwitcher());

      // User already set neon-float manually
      expect(result.current.currentNavStyle.id).toBe('neon-float');

      act(() => {
        result.current.setNavStyleFromTheme('terminal');
      });

      // Should still be neon-float because user override is active
      expect(result.current.currentNavStyle.id).toBe('neon-float');
    });

    it('should reset to theme default and clear override', () => {
      const { result } = renderHook(() => useNavStyleSwitcher());

      // User manually overrides
      act(() => {
        result.current.switchNavStyle('neon-float');
      });
      expect(result.current.isOverridden).toBe(true);
      expect(result.current.currentNavStyle.id).toBe('neon-float');

      // Reset to theme default for terminal theme
      act(() => {
        result.current.resetToThemeDefault('terminal');
      });

      expect(result.current.isOverridden).toBe(false);
      expect(result.current.currentNavStyle.id).toBe('cli-prompt');
      expect(localStorage.getItem('bjnewman-nav-style-override')).toBeNull();
    });
  });

  describe('nav style properties', () => {
    it('each nav style should have required properties', () => {
      navStyles.forEach((style) => {
        expect(style).toHaveProperty('id');
        expect(style).toHaveProperty('name');
        expect(style).toHaveProperty('emoji');
        expect(style).toHaveProperty('className');
        expect(style.className.startsWith('nav-')).toBe(true);
      });
    });
  });
});
