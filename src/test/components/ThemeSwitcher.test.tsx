import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeSwitcher } from '../../components/ThemeSwitcher';

// Mock useAtmosphere
const mockSetOverride = vi.fn();
let mockSeason = 'spring';
let mockOverride: string | null = null;

vi.mock('../../components/Atmosphere/useAtmosphere', () => ({
  useAtmosphere: () => ({
    season: mockSeason,
    setOverride: mockSetOverride,
    override: mockOverride,
    timeOfDay: 'midday',
    seasonProgress: 0.5,
    dayProgress: 0.5,
  }),
}));

// Mock applySeasonPalette
const mockApplySeasonPalette = vi.fn();
vi.mock('../../components/Atmosphere/applySeasonPalette', () => ({
  applySeasonPalette: (...args: unknown[]) => mockApplySeasonPalette(...args),
}));

describe('useThemeSwitcher - Seasonal Atmosphere', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.cssText = '';
    document.body.style.cssText = '';
    document.body.className = '';
    mockSeason = 'spring';
    mockOverride = null;
    mockSetOverride.mockClear();
    mockApplySeasonPalette.mockClear();
  });

  it('should return the current season from atmosphere', () => {
    const { result } = renderHook(() => useThemeSwitcher());
    expect(result.current.currentSeason).toBe('spring');
  });

  it('should return all four seasons', () => {
    const { result } = renderHook(() => useThemeSwitcher());
    expect(result.current.seasons).toHaveLength(4);
    expect(result.current.seasons.map((s) => s.id)).toEqual([
      'spring',
      'summer',
      'fall',
      'winter',
    ]);
  });

  it('should capitalize season names', () => {
    const { result } = renderHook(() => useThemeSwitcher());
    expect(result.current.seasons[0].name).toBe('Spring');
    expect(result.current.seasons[2].name).toBe('Fall');
  });

  it('should delegate season override to useAtmosphere', () => {
    const { result } = renderHook(() => useThemeSwitcher());
    act(() => {
      result.current.setSeasonOverride('winter');
    });
    expect(mockSetOverride).toHaveBeenCalledWith('winter');
  });

  it('should apply season palette on mount', () => {
    renderHook(() => useThemeSwitcher());
    expect(mockApplySeasonPalette).toHaveBeenCalledWith('spring', false);
  });

  it('should initialize isDarkMode as false by default', () => {
    const { result } = renderHook(() => useThemeSwitcher());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useThemeSwitcher());

    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(true);
  });

  it('should persist dark mode to localStorage', () => {
    const { result } = renderHook(() => useThemeSwitcher());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(localStorage.getItem('bjnewman-dark-mode')).toBe('true');

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(localStorage.getItem('bjnewman-dark-mode')).toBe('false');
  });

  it('should load dark mode from localStorage', () => {
    localStorage.setItem('bjnewman-dark-mode', 'true');

    const { result } = renderHook(() => useThemeSwitcher());
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should apply palette with dark mode when toggled', () => {
    const { result } = renderHook(() => useThemeSwitcher());

    mockApplySeasonPalette.mockClear();

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(mockApplySeasonPalette).toHaveBeenCalledWith('spring', true);
  });

  it('should remove old theme classes on effect', () => {
    document.body.classList.add('theme-brutalist', 'theme-90s');

    renderHook(() => useThemeSwitcher());

    expect(document.body.classList.contains('theme-brutalist')).toBe(false);
    expect(document.body.classList.contains('theme-90s')).toBe(false);
  });

  it('should expose the override from atmosphere', () => {
    mockOverride = 'winter';
    const { result } = renderHook(() => useThemeSwitcher());
    expect(result.current.override).toBe('winter');
  });
});
