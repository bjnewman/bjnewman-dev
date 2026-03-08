import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAtmosphere } from '../../../components/Atmosphere/useAtmosphere';
import { applySeasonPalette } from '../../../components/Atmosphere/applySeasonPalette';

describe('useAtmosphere', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with a valid season', () => {
    const { result } = renderHook(() => useAtmosphere());
    expect(['spring', 'summer', 'fall', 'winter']).toContain(result.current.season);
  });

  it('should initialize with a valid time of day', () => {
    const { result } = renderHook(() => useAtmosphere());
    const validTimes = ['dawn', 'morning', 'midday', 'afternoon', 'goldenHour', 'dusk', 'night', 'lateNight'];
    expect(validTimes).toContain(result.current.timeOfDay);
  });

  it('should cycle through seasons over time', () => {
    const { result } = renderHook(() => useAtmosphere());
    const initialSeason = result.current.season;

    // Advance past one full season cycle (~150 seconds)
    act(() => {
      vi.advanceTimersByTime(160_000);
    });

    // Season should have changed
    expect(result.current.season).not.toBe(initialSeason);
  });

  it('should allow manual season override', () => {
    const { result } = renderHook(() => useAtmosphere());

    act(() => {
      result.current.setOverride('winter');
    });

    expect(result.current.season).toBe('winter');
    expect(result.current.override).toBe('winter');
  });

  it('should persist override to localStorage', () => {
    const { result } = renderHook(() => useAtmosphere());

    act(() => {
      result.current.setOverride('fall');
    });

    expect(localStorage.getItem('atmosphere-override')).toBe('fall');
  });

  it('should clear override when set to null', () => {
    const { result } = renderHook(() => useAtmosphere());

    act(() => {
      result.current.setOverride('winter');
    });
    expect(result.current.override).toBe('winter');

    act(() => {
      result.current.setOverride(null);
    });
    expect(result.current.override).toBeNull();
  });

  it('should restore override from localStorage', () => {
    localStorage.setItem('atmosphere-override', 'summer');
    const { result } = renderHook(() => useAtmosphere());
    expect(result.current.season).toBe('summer');
    expect(result.current.override).toBe('summer');
  });

  it('should expose season progress as a 0-1 value', () => {
    const { result } = renderHook(() => useAtmosphere());
    expect(result.current.seasonProgress).toBeGreaterThanOrEqual(0);
    expect(result.current.seasonProgress).toBeLessThanOrEqual(1);
  });

  it('should expose day progress as a 0-1 value', () => {
    const { result } = renderHook(() => useAtmosphere());
    expect(result.current.dayProgress).toBeGreaterThanOrEqual(0);
    expect(result.current.dayProgress).toBeLessThanOrEqual(1);
  });
});

describe('applySeasonPalette', () => {
  beforeEach(() => {
    document.documentElement.style.cssText = '';
    document.body.style.cssText = '';
  });

  it('should set CSS custom properties for a season', () => {
    applySeasonPalette('spring');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#10b981');
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#ec4899');
  });

  it('should override text colors in dark mode', () => {
    applySeasonPalette('spring', true);
    expect(document.documentElement.style.getPropertyValue('--text-primary')).toBe('#f1f5f9');
    expect(document.documentElement.style.getPropertyValue('--bg-primary')).toBe('#1e293b');
  });
});
