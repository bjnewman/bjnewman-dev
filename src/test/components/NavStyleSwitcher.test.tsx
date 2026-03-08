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

  describe('season integration', () => {
    it('should have correct default nav styles for each season', () => {
      expect(themeNavDefaults['spring']).toBe('filing-tabs');
      expect(themeNavDefaults['summer']).toBe('filing-tabs');
      expect(themeNavDefaults['fall']).toBe('filing-tabs');
      expect(themeNavDefaults['winter']).toBe('filing-tabs');
    });

    it('should update nav style when season changes (no override)', () => {
      const { result } = renderHook(() => useNavStyleSwitcher());

      act(() => {
        result.current.setNavStyleFromTheme('summer');
      });

      expect(result.current.currentNavStyle.id).toBe('filing-tabs');
    });

    it('should NOT update nav style when season changes if user has override', () => {
      localStorage.setItem('bjnewman-nav-style-override', 'true');
      localStorage.setItem('bjnewman-nav-style', 'neon-float');

      const { result } = renderHook(() => useNavStyleSwitcher());

      // User already set neon-float manually
      expect(result.current.currentNavStyle.id).toBe('neon-float');

      act(() => {
        result.current.setNavStyleFromTheme('winter');
      });

      // Should still be neon-float because user override is active
      expect(result.current.currentNavStyle.id).toBe('neon-float');
    });

    it('should reset to season default and clear override', () => {
      const { result } = renderHook(() => useNavStyleSwitcher());

      // User manually overrides
      act(() => {
        result.current.switchNavStyle('neon-float');
      });
      expect(result.current.isOverridden).toBe(true);
      expect(result.current.currentNavStyle.id).toBe('neon-float');

      // Reset to season default
      act(() => {
        result.current.resetToThemeDefault('fall');
      });

      expect(result.current.isOverridden).toBe(false);
      expect(result.current.currentNavStyle.id).toBe('filing-tabs');
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
