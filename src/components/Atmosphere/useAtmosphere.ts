import { useState, useEffect, useRef, useCallback } from 'react';
import type { Season, TimeOfDay, AtmosphereState, WeatherOverrides } from './types';

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];
const DEFAULT_SEASON_DURATION = 150_000; // 2.5 min per season
const DEFAULT_DAY_DURATION = 600_000; // 10 min full day cycle
const TICK_INTERVAL = 1_000; // 1-second ticks
const STORAGE_KEY = 'atmosphere-override';
const SEASON_DURATION_KEY = 'atmosphere-season-duration';
const DAY_DURATION_KEY = 'atmosphere-day-duration';
const WEATHER_KEY = 'atmosphere-weather';
const WEATHER_OVERRIDES_KEY = 'atmosphere-weather-overrides';

type TimePhase = { threshold: number; name: TimeOfDay };

const TIME_PHASES: TimePhase[] = [
  { threshold: 0.0, name: 'dawn' },
  { threshold: 0.1, name: 'morning' },
  { threshold: 0.25, name: 'midday' },
  { threshold: 0.45, name: 'afternoon' },
  { threshold: 0.6, name: 'goldenHour' },
  { threshold: 0.7, name: 'dusk' },
  { threshold: 0.8, name: 'night' },
  { threshold: 0.9, name: 'lateNight' },
];

function getTimeOfDay(dayProgress: number): TimeOfDay {
  let result: TimeOfDay = 'dawn';
  for (const phase of TIME_PHASES) {
    if (dayProgress >= phase.threshold) {
      result = phase.name;
    }
  }
  return result;
}

function loadOverride(): Season | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SEASONS.includes(stored as Season)) {
    return stored as Season;
  }
  return null;
}

function loadNumber(key: string, fallback: number): number {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (stored) {
    const n = Number(stored);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return fallback;
}

function loadBoolean(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return fallback;
}

function loadWeatherOverrides(): WeatherOverrides {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(WEATHER_OVERRIDES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as WeatherOverrides;
    } catch {
      return {};
    }
  }
  return {};
}

export type UseAtmosphereReturn = AtmosphereState & {
  setOverride: (season: Season | null) => void;
  seasonDuration: number;
  dayDuration: number;
  setSeasonDuration: (ms: number) => void;
  setDayDuration: (ms: number) => void;
  setDayProgress: (progress: number) => void;
  weatherEnabled: boolean;
  setWeatherEnabled: (enabled: boolean) => void;
  weatherOverrides: WeatherOverrides;
  setWeatherOverrides: (overrides: WeatherOverrides) => void;
  resetWeatherOverrides: () => void;
  resetToDefaults: () => void;
};

export function useAtmosphere(): UseAtmosphereReturn {
  const startTimeRef = useRef(Date.now());
  const [override, setOverrideState] = useState<Season | null>(loadOverride);
  const [tick, setTick] = useState(0);
  const [seasonDuration, setSeasonDurationState] = useState(() =>
    loadNumber(SEASON_DURATION_KEY, DEFAULT_SEASON_DURATION)
  );
  const [dayDuration, setDayDurationState] = useState(() =>
    loadNumber(DAY_DURATION_KEY, DEFAULT_DAY_DURATION)
  );
  const [weatherEnabled, setWeatherEnabledState] = useState(() =>
    loadBoolean(WEATHER_KEY, true)
  );
  const [weatherOverrides, setWeatherOverridesState] = useState<WeatherOverrides>(
    loadWeatherOverrides
  );
  // Offset added when user jumps to a specific day progress
  const dayOffsetRef = useRef(0);

  // Tick interval to drive re-computation
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, TICK_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Compute elapsed time from startTime ref — works with vi.useFakeTimers
  const elapsed = Date.now() - startTimeRef.current;

  // Season computation
  const fullCycleDuration = seasonDuration * SEASONS.length;
  const seasonIndex = Math.floor((elapsed % fullCycleDuration) / seasonDuration);
  const seasonProgress = (elapsed % seasonDuration) / seasonDuration;

  // Day computation (with offset for time jumping)
  const rawDayProgress = ((elapsed + dayOffsetRef.current) % dayDuration) / dayDuration;
  const dayProgress = rawDayProgress < 0 ? rawDayProgress + 1 : rawDayProgress;
  const timeOfDay = getTimeOfDay(dayProgress);

  // Resolved season (override takes precedence)
  const season = override ?? SEASONS[seasonIndex];

  const setOverride = useCallback((value: Season | null) => {
    setOverrideState(value);
    if (value === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, value);
    }
  }, []);

  const setSeasonDuration = useCallback((ms: number) => {
    setSeasonDurationState(ms);
    localStorage.setItem(SEASON_DURATION_KEY, String(ms));
  }, []);

  const setDayDuration = useCallback((ms: number) => {
    setDayDurationState(ms);
    localStorage.setItem(DAY_DURATION_KEY, String(ms));
  }, []);

  const setDayProgress = useCallback((progress: number) => {
    // Calculate offset so that current elapsed maps to the desired progress
    const currentElapsed = Date.now() - startTimeRef.current;
    const targetMs = progress * dayDuration;
    const currentMs = currentElapsed % dayDuration;
    dayOffsetRef.current = targetMs - currentMs;
    // Force re-render
    setTick((t) => t + 1);
  }, [dayDuration]);

  const setWeatherEnabled = useCallback((enabled: boolean) => {
    setWeatherEnabledState(enabled);
    localStorage.setItem(WEATHER_KEY, String(enabled));
  }, []);

  const setWeatherOverrides = useCallback((overrides: WeatherOverrides) => {
    setWeatherOverridesState(overrides);
    localStorage.setItem(WEATHER_OVERRIDES_KEY, JSON.stringify(overrides));
  }, []);

  const resetWeatherOverrides = useCallback(() => {
    setWeatherOverridesState({});
    localStorage.removeItem(WEATHER_OVERRIDES_KEY);
  }, []);

  const resetToDefaults = useCallback(() => {
    setOverrideState(null);
    setSeasonDurationState(DEFAULT_SEASON_DURATION);
    setDayDurationState(DEFAULT_DAY_DURATION);
    setWeatherEnabledState(true);
    setWeatherOverridesState({});
    dayOffsetRef.current = 0;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SEASON_DURATION_KEY);
    localStorage.removeItem(DAY_DURATION_KEY);
    localStorage.removeItem(WEATHER_KEY);
    localStorage.removeItem(WEATHER_OVERRIDES_KEY);
  }, []);

  // Suppress unused variable warning — tick drives re-renders
  void tick;

  return {
    season,
    timeOfDay,
    seasonProgress,
    dayProgress,
    override,
    setOverride,
    seasonDuration,
    dayDuration,
    setSeasonDuration,
    setDayDuration,
    setDayProgress,
    weatherEnabled,
    setWeatherEnabled,
    weatherOverrides,
    setWeatherOverrides,
    resetWeatherOverrides,
    resetToDefaults,
  };
}
