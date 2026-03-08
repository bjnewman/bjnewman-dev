import { useState, useEffect, useRef, useCallback } from 'react';
import type { Season, TimeOfDay, AtmosphereState } from './types';

const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];
const SEASON_DURATION = 150_000; // 2.5 min per season
const DAY_DURATION = 600_000; // 10 min full day cycle
const TICK_INTERVAL = 1_000; // 1-second ticks
const STORAGE_KEY = 'atmosphere-override';

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

type UseAtmosphereReturn = AtmosphereState & {
  setOverride: (season: Season | null) => void;
};

export function useAtmosphere(): UseAtmosphereReturn {
  const startTimeRef = useRef(Date.now());
  const [override, setOverrideState] = useState<Season | null>(loadOverride);
  const [tick, setTick] = useState(0);

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
  const fullCycleDuration = SEASON_DURATION * SEASONS.length;
  const seasonIndex = Math.floor((elapsed % fullCycleDuration) / SEASON_DURATION);
  const seasonProgress = (elapsed % SEASON_DURATION) / SEASON_DURATION;

  // Day computation
  const dayProgress = (elapsed % DAY_DURATION) / DAY_DURATION;
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

  // Suppress unused variable warning — tick drives re-renders
  void tick;

  return {
    season,
    timeOfDay,
    seasonProgress,
    dayProgress,
    override,
    setOverride,
  };
}
