# Visual Polish & Atmosphere System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the legacy 11-theme system with a unified atmosphere engine (seasons + day/night), fix duck sound muting, enhance clouds/weather, add door transitions, and update Holland's page.

**Architecture:** A `useAtmosphere` React context provides season + time-of-day state that drives PixiJS rendering (sky, clouds, weather particles, terrain tinting) and CSS custom properties (interior page palettes). Sound is centralized through an audio context. Door transitions animate in PixiJS before page navigation.

**Tech Stack:** React 19, PixiJS + @pixi/react, Vitest, Astro, CSS custom properties

---

### Task 1: Holland's Page Guard Notice

**Files:**
- Modify: `src/pages/holland.astro:1-57`

**Step 1: Add the guard notice RPGPanel**

In `src/pages/holland.astro`, add a new `RPGPanel` at the top of the content (after line 6, before the existing welcome panel):

```astro
<RPGPanel variant="wood">
  <p class="holland-guard"><strong>HALT, TRAVELER!</strong> This page is for Holland and Holland ONLY. All unauthorized visitors must immediately close their eyes, spin around three times, and forget everything they saw. Violators will be turned into frogs.</p>
  <p class="holland-guard holland-guard--warning"><em>(You have been warned.)</em></p>
</RPGPanel>
```

**Step 2: Add CSS for the guard notice**

In the `<style>` block at the bottom of the file, add:

```css
.holland-guard {
  text-align: center;
  font-size: 1rem;
  color: #3a2a1a;
  margin: 0.5rem 0;
}

.holland-guard--warning {
  font-size: 0.9rem;
  color: #6a4a2a;
}
```

**Step 3: Run tests and verify**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test`
Expected: All 287 tests pass (this is static content, no new tests needed)

**Step 4: Verify build**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/pages/holland.astro
git commit -m "feat: add RPG guard notice to Holland's page"
```

---

### Task 2: Centralize Audio — Create AudioProvider Context

**Files:**
- Create: `src/components/Overworld/AudioProvider.tsx`
- Modify: `src/components/Overworld/useSoundEffects.ts:15-114`
- Test: `src/test/components/Overworld/useSoundEffects.test.ts`

**Step 1: Write failing tests for the new `useAudio` hook**

Extend `src/test/components/Overworld/useSoundEffects.test.ts` to add tests for the new centralized API:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundEffects } from '../../../components/Overworld/useSoundEffects';

// Keep all existing tests unchanged

describe('useSoundEffects — centralized playSound', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should expose a generic playSound function', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(typeof result.current.playSound).toBe('function');
  });

  it('should not throw when playing a synthesized sound while muted', () => {
    const { result } = renderHook(() => useSoundEffects());
    // Should be muted by default, calling playSound should be a no-op
    expect(() => result.current.playSound('quack')).not.toThrow();
  });

  it('should register and play custom synthesized sounds', () => {
    const { result } = renderHook(() => useSoundEffects());
    // Unmute first
    act(() => {
      result.current.toggleMute();
    });
    // Playing a synthesized sound should not throw
    expect(() => result.current.playSound('quack')).not.toThrow();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test -- src/test/components/Overworld/useSoundEffects.test.ts`
Expected: FAIL — `playSound` not found on hook result

**Step 3: Add `playSound` to useSoundEffects**

Modify `src/components/Overworld/useSoundEffects.ts`:

1. Add a `SYNTH_SOUNDS` registry after `SOUND_PATHS` (line 11):

```typescript
// Synthesized sounds (Web Audio API, no file needed)
type SynthSoundFn = (ctx: AudioContext) => void;

const SYNTH_SOUNDS: Record<string, SynthSoundFn> = {
  quack: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  },
};
```

2. Add a `playSound` function to the hook (after the existing `playSound` internal, rename existing to `playFileSound`):

The hook should expose a new public `playSound(name: string)` that:
- Checks mute state, returns early if muted
- First checks `SYNTH_SOUNDS[name]` — if found, calls it with AudioContext
- Otherwise falls through to file-based `playFileSound`

3. Add `playSound` to the return object alongside existing convenience functions.

**Step 4: Run tests to verify they pass**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test -- src/test/components/Overworld/useSoundEffects.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/components/Overworld/useSoundEffects.ts src/test/components/Overworld/useSoundEffects.test.ts
git commit -m "feat: add centralized playSound with synth sound registry"
```

---

### Task 3: Fix Duck Quack to Use Centralized Audio

**Files:**
- Modify: `src/components/Overworld/EasterEggs.tsx:1-68`
- Modify: `src/components/Overworld/OverworldCanvas.tsx:23`
- Modify: `src/components/Overworld/index.tsx:22`

**Step 1: Pass muted state and playSound to EasterEggs**

In `src/components/Overworld/OverworldCanvas.tsx`:

1. Add `muted` and `playSound` to `Props` type (line 16-21):
```typescript
type Props = {
  state: GameState;
  onCanvasClick: (worldX: number, worldY: number) => void;
  onBuildingDoubleClick: (building: Building) => void;
  playerScale?: number;
  playSound: (name: string) => void;
};
```

2. Pass `playSound` through to `<EasterEggs>` (line 66):
```tsx
<EasterEggs playSound={playSound} />
```

In `src/components/Overworld/index.tsx`:

3. Destructure `playSound` from `useSoundEffects()` (line 22)
4. Pass `playSound` to `<OverworldCanvas>` (line 291)

**Step 2: Refactor RubberDuck to use centralized audio**

In `src/components/Overworld/EasterEggs.tsx`:

1. Update `EasterEggs` to accept and pass `playSound` prop:
```tsx
export function EasterEggs({ playSound }: { playSound: (name: string) => void }) {
  const duckX = 5 * TILE_SIZE + 16;
  const duckY = 11 * TILE_SIZE + 16;
  return <RubberDuck x={duckX} y={duckY} playSound={playSound} />;
}
```

2. Update `RubberDuck` props and replace inline Web Audio with `playSound('quack')`:
```tsx
function RubberDuck({ x, y, playSound }: { x: number; y: number; playSound: (name: string) => void }) {
```

3. Replace `onPointerDown` handler (lines 48-64) with:
```tsx
onPointerDown={() => playSound('quack')}
```

This removes the inline AudioContext creation entirely.

**Step 3: Run tests**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test`
Expected: All tests pass

**Step 4: Verify build**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/components/Overworld/EasterEggs.tsx src/components/Overworld/OverworldCanvas.tsx src/components/Overworld/index.tsx
git commit -m "fix: duck quack now respects global mute toggle"
```

---

### Task 4: Atmosphere Context — Season + Time State

**Files:**
- Create: `src/components/Atmosphere/types.ts`
- Create: `src/components/Atmosphere/useAtmosphere.ts`
- Create: `src/components/Atmosphere/seasonPalettes.ts`
- Test: `src/test/components/Atmosphere/useAtmosphere.test.ts`

**Step 1: Create types**

Create `src/components/Atmosphere/types.ts`:

```typescript
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export type TimeOfDay =
  | 'dawn'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'goldenHour'
  | 'dusk'
  | 'night'
  | 'lateNight';

export type AtmosphereState = {
  season: Season;
  timeOfDay: TimeOfDay;
  /** 0-1 progress through current season */
  seasonProgress: number;
  /** 0-1 progress through current day cycle */
  dayProgress: number;
  /** User override, null = auto */
  override: Season | null;
};

export type SeasonPalette = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  bgGradient: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
};
```

**Step 2: Create season palettes**

Create `src/components/Atmosphere/seasonPalettes.ts`:

```typescript
import type { Season, SeasonPalette } from './types';

export const seasonPalettes: Record<Season, SeasonPalette> = {
  spring: {
    primary: '#10b981',
    primaryLight: '#34d399',
    primaryDark: '#059669',
    accent: '#ec4899',
    accentLight: '#f472b6',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, #d1fae5 0%, #fce7f3 50%, #e0f2fe 100%)',
    bgPrimary: '#ffffff',
    bgSecondary: '#f0fdf4',
    bgTertiary: '#ecfdf5',
  },
  summer: {
    primary: '#f59e0b',
    primaryLight: '#fbbf24',
    primaryDark: '#d97706',
    accent: '#0ea5e9',
    accentLight: '#38bdf8',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #e0f2fe 50%, #fff7ed 100%)',
    bgPrimary: '#ffffff',
    bgSecondary: '#fffbeb',
    bgTertiary: '#fef9c3',
  },
  fall: {
    primary: '#ea580c',
    primaryLight: '#f97316',
    primaryDark: '#c2410c',
    accent: '#a855f7',
    accentLight: '#c084fc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, #fff7ed 0%, #fef2f2 50%, #faf5ff 100%)',
    bgPrimary: '#ffffff',
    bgSecondary: '#fff7ed',
    bgTertiary: '#ffedd5',
  },
  winter: {
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    accent: '#06b6d4',
    accentLight: '#22d3ee',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    bgGradient: 'linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
    bgPrimary: '#ffffff',
    bgSecondary: '#f0f9ff',
    bgTertiary: '#e0f2fe',
  },
};

/** Dark mode variant — adjusts any palette for dark backgrounds */
export const darkModeOverrides: Partial<SeasonPalette> = {
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  bgPrimary: '#1e293b',
  bgSecondary: '#334155',
  bgTertiary: '#475569',
};
```

**Step 3: Write failing tests for useAtmosphere**

Create `src/test/components/Atmosphere/useAtmosphere.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAtmosphere } from '../../../components/Atmosphere/useAtmosphere';

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
```

**Step 4: Run tests to verify they fail**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test -- src/test/components/Atmosphere`
Expected: FAIL — module not found

**Step 5: Implement useAtmosphere**

Create `src/components/Atmosphere/useAtmosphere.ts`:

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Season, TimeOfDay } from './types';

const SEASON_DURATION = 150_000; // ~2.5 min per season
const DAY_DURATION = 600_000;    // 10 min full day cycle
const TICK_INTERVAL = 1000;      // update every second
const STORAGE_KEY = 'atmosphere-override';

const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];

const TIME_PHASES: { threshold: number; phase: TimeOfDay }[] = [
  { threshold: 0,    phase: 'dawn' },
  { threshold: 0.1,  phase: 'morning' },
  { threshold: 0.25, phase: 'midday' },
  { threshold: 0.45, phase: 'afternoon' },
  { threshold: 0.6,  phase: 'goldenHour' },
  { threshold: 0.7,  phase: 'dusk' },
  { threshold: 0.8,  phase: 'night' },
  { threshold: 0.9,  phase: 'lateNight' },
];

function getTimeOfDay(dayProgress: number): TimeOfDay {
  let phase: TimeOfDay = 'dawn';
  for (const entry of TIME_PHASES) {
    if (dayProgress >= entry.threshold) phase = entry.phase;
  }
  return phase;
}

export function useAtmosphere() {
  const startTime = useRef(Date.now());

  const [override, setOverrideState] = useState<Season | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && SEASONS.includes(saved as Season) ? (saved as Season) : null;
  });

  const [tick, setTick] = useState(0);

  // Tick every second to advance time
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const elapsed = Date.now() - startTime.current + tick * 0; // tick triggers re-render
  // Actually compute from real time so fake timers work:
  const now = Date.now();
  const totalElapsed = now - startTime.current;

  const seasonCycleProgress = (totalElapsed % (SEASON_DURATION * 4)) / (SEASON_DURATION * 4);
  const seasonIndex = Math.floor(seasonCycleProgress * 4) % 4;
  const seasonProgress = (seasonCycleProgress * 4) % 1;

  const dayProgress = (totalElapsed % DAY_DURATION) / DAY_DURATION;
  const timeOfDay = getTimeOfDay(dayProgress);

  const autoSeason = SEASONS[seasonIndex];
  const season = override ?? autoSeason;

  const setOverride = useCallback((s: Season | null) => {
    setOverrideState(s);
    if (s) {
      localStorage.setItem(STORAGE_KEY, s);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    season,
    timeOfDay,
    seasonProgress,
    dayProgress,
    override,
    setOverride,
  };
}
```

**Step 6: Run tests to verify they pass**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test -- src/test/components/Atmosphere`
Expected: All tests PASS

**Step 7: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/components/Atmosphere/ src/test/components/Atmosphere/
git commit -m "feat: add useAtmosphere hook with season cycling"
```

---

### Task 5: Apply Seasonal CSS Palettes to Interior Pages

**Files:**
- Create: `src/components/Atmosphere/applySeasonPalette.ts`
- Modify: `src/components/Atmosphere/useAtmosphere.ts`
- Test: `src/test/components/Atmosphere/useAtmosphere.test.ts`

**Step 1: Create the palette application function**

Create `src/components/Atmosphere/applySeasonPalette.ts`:

```typescript
import type { Season } from './types';
import { seasonPalettes, darkModeOverrides } from './seasonPalettes';

export function applySeasonPalette(season: Season, isDark: boolean = false) {
  const palette = { ...seasonPalettes[season] };
  if (isDark) {
    Object.assign(palette, darkModeOverrides);
    // Darken the gradient for dark mode
    palette.bgGradient = `linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)`;
  }

  const root = document.documentElement;
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-light', palette.primaryLight);
  root.style.setProperty('--primary-dark', palette.primaryDark);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-light', palette.accentLight);
  root.style.setProperty('--text-primary', palette.textPrimary);
  root.style.setProperty('--text-secondary', palette.textSecondary);
  root.style.setProperty('--text-muted', palette.textMuted);
  root.style.setProperty('--bg-primary', palette.bgPrimary);
  root.style.setProperty('--bg-secondary', palette.bgSecondary);
  root.style.setProperty('--bg-tertiary', palette.bgTertiary);

  document.body.style.background = palette.bgGradient;
  document.body.style.backgroundAttachment = 'fixed';
}
```

**Step 2: Write test for palette application**

Add to `src/test/components/Atmosphere/useAtmosphere.test.ts`:

```typescript
import { applySeasonPalette } from '../../../components/Atmosphere/applySeasonPalette';

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
```

**Step 3: Run tests**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test -- src/test/components/Atmosphere`
Expected: All PASS

**Step 4: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/components/Atmosphere/applySeasonPalette.ts src/test/components/Atmosphere/useAtmosphere.test.ts
git commit -m "feat: add season palette application for interior pages"
```

---

### Task 6: PixiJS Day/Night Overlay

**Files:**
- Create: `src/components/Overworld/DayNightOverlay.tsx`
- Modify: `src/components/Overworld/OverworldCanvas.tsx`
- Modify: `src/components/Overworld/index.tsx`
- Modify: `src/styles/overworld.css:431-456` (remove CSS daynight)

**Step 1: Create the DayNightOverlay component**

Create `src/components/Overworld/DayNightOverlay.tsx`:

```tsx
import { useCallback } from 'react';
import { extend, useTick } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

extend({ Graphics: PixiGraphics });

type Props = {
  dayProgress: number;
};

// Smooth color interpolation for day/night
const DAY_PHASES = [
  { at: 0.00, r: 0, g: 0, b: 0, a: 0 },       // dawn start
  { at: 0.05, r: 255, g: 180, b: 100, a: 0.08 }, // sunrise
  { at: 0.10, r: 0, g: 0, b: 0, a: 0 },         // morning
  { at: 0.45, r: 0, g: 0, b: 0, a: 0 },         // midday (clear)
  { at: 0.60, r: 255, g: 140, b: 50, a: 0.12 },  // golden hour
  { at: 0.70, r: 180, g: 80, b: 40, a: 0.2 },    // sunset
  { at: 0.78, r: 15, g: 15, b: 60, a: 0.35 },    // dusk
  { at: 0.85, r: 5, g: 5, b: 30, a: 0.4 },       // night
  { at: 0.92, r: 5, g: 5, b: 30, a: 0.4 },       // late night
  { at: 0.97, r: 80, g: 50, b: 100, a: 0.15 },   // pre-dawn
  { at: 1.00, r: 0, g: 0, b: 0, a: 0 },          // dawn (loops)
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getOverlayColor(progress: number) {
  let prev = DAY_PHASES[DAY_PHASES.length - 1];
  for (const phase of DAY_PHASES) {
    if (progress <= phase.at) {
      const range = phase.at - prev.at || 1;
      const t = (progress - prev.at) / range;
      return {
        r: Math.round(lerp(prev.r, phase.r, t)),
        g: Math.round(lerp(prev.g, phase.g, t)),
        b: Math.round(lerp(prev.b, phase.b, t)),
        a: lerp(prev.a, phase.a, t),
      };
    }
    prev = phase;
  }
  return { r: 0, g: 0, b: 0, a: 0 };
}

export function DayNightOverlay({ dayProgress }: Props) {
  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      const { r, g: green, b, a } = getOverlayColor(dayProgress);
      if (a > 0.001) {
        g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        g.fill({ color: (r << 16) | (green << 8) | b, alpha: a });
      }
    },
    [dayProgress]
  );

  return <graphics draw={draw} zIndex={100} />;
}
```

**Step 2: Wire into OverworldCanvas**

In `src/components/Overworld/OverworldCanvas.tsx`:

1. Import `DayNightOverlay`
2. Add `dayProgress: number` to `Props`
3. Render `<DayNightOverlay dayProgress={dayProgress} />` after `<PlayerSprite>`

**Step 3: Wire useAtmosphere into Overworld/index.tsx**

In `src/components/Overworld/index.tsx`:

1. Import `useAtmosphere` from `../Atmosphere/useAtmosphere`
2. Call `const { dayProgress } = useAtmosphere();` in the component
3. Pass `dayProgress` to `<OverworldCanvas>`

**Step 4: Remove CSS day/night overlay**

In `src/styles/overworld.css`, remove lines 430-456 (the `.overworld__daynight` rules and `@keyframes daynight-cycle`).

In `src/components/Overworld/index.tsx`, remove the `<div className="overworld__daynight" />` element (line 292).

**Step 5: Run tests and build**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test`
Expected: All pass

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/components/Overworld/DayNightOverlay.tsx src/components/Overworld/OverworldCanvas.tsx src/components/Overworld/index.tsx src/styles/overworld.css
git commit -m "feat: replace CSS day/night with PixiJS smooth overlay"
```

---

### Task 7: Enhanced Clouds — More Density and Variety

**Files:**
- Modify: `src/components/Overworld/AmbientEffects.tsx:96-127`

**Step 1: Increase cloud count and add variety**

Replace the 3 hardcoded `<DriftingCloud>` instances (lines 116-118) with a dynamically generated array of 8-12 clouds. Each cloud should have randomized (but deterministic via seed) properties:

```tsx
// Generate varied cloud field
const clouds = [
  { src: '/assets/overworld/decorations/cloud1.png', startX: -200, y: -10, speed: 0.12, scale: 0.35, alpha: 0.5 },
  { src: '/assets/overworld/decorations/cloud2.png', startX: 100,  y: 5,   speed: 0.08, scale: 0.4,  alpha: 0.55 },
  { src: '/assets/overworld/decorations/cloud3.png', startX: 400,  y: -25, speed: 0.15, scale: 0.2,  alpha: 0.45 },
  { src: '/assets/overworld/decorations/cloud1.png', startX: 700,  y: 15,  speed: 0.1,  scale: 0.25, alpha: 0.4 },
  { src: '/assets/overworld/decorations/cloud2.png', startX: -400, y: 35,  speed: 0.18, scale: 0.15, alpha: 0.35 },
  { src: '/assets/overworld/decorations/cloud3.png', startX: 250,  y: -5,  speed: 0.06, scale: 0.5,  alpha: 0.6 },
  { src: '/assets/overworld/decorations/cloud1.png', startX: 550,  y: 25,  speed: 0.14, scale: 0.22, alpha: 0.5 },
  { src: '/assets/overworld/decorations/cloud2.png', startX: -100, y: 40,  speed: 0.09, scale: 0.3,  alpha: 0.4 },
  { src: '/assets/overworld/decorations/cloud3.png', startX: 850,  y: 0,   speed: 0.11, scale: 0.28, alpha: 0.45 },
  { src: '/assets/overworld/decorations/cloud1.png', startX: 300,  y: 50,  speed: 0.07, scale: 0.18, alpha: 0.3 },
];
```

**Step 2: Update DriftingCloud to accept alpha prop**

Modify the `DriftingCloud` component to accept an `alpha` prop instead of hardcoding 0.6:

```tsx
function DriftingCloud({ src, startX, y, speed, scale, alpha = 0.6 }: {
  src: string; startX: number; y: number; speed: number; scale: number; alpha?: number;
}) {
```

Use `alpha={alpha}` on the sprite (line 89).

**Step 3: Run tests and build**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test`
Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run build`

**Step 4: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/components/Overworld/AmbientEffects.tsx
git commit -m "feat: increase cloud density with varied sizes and speeds"
```

---

### Task 8: Seasonal Weather Particles (using @pixi/particle-emitter)

**Files:**
- Create: `src/components/Overworld/WeatherParticles.tsx`
- Modify: `src/components/Overworld/OverworldCanvas.tsx`

**Step 0: Install dependency**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev add @pixi/particle-emitter`

**Step 1: Create WeatherParticles component**

Create `src/components/Overworld/WeatherParticles.tsx`:

Use `@pixi/particle-emitter` to render seasonal particle effects:
- **Spring**: Light rain — fast narrow particles, slight diagonal angle, blue-white
- **Summer**: None (return null)
- **Fall**: Falling leaves — slow, wide sway, orange/red/brown color range, rotation
- **Winter**: Snowfall — slow descent, gentle horizontal drift, white, varied sizes

Key implementation:
- Import `Emitter` from `@pixi/particle-emitter`
- Create emitter config per season (emission rate, particle speed, lifetime, color, scale)
- Use `useEffect` to create/destroy emitter when season changes
- Use `useTick` to call `emitter.update(dt)` each frame
- Attach emitter to a `Container` ref
- Respect `prefers-reduced-motion` — skip rendering if user prefers reduced motion
- Use `Season` type prop

Example config structure for rain:
```typescript
const rainConfig = {
  lifetime: { min: 0.5, max: 1.0 },
  frequency: 0.004,
  maxParticles: 100,
  pos: { x: 0, y: 0 },
  behaviors: [
    { type: 'spawnShape', config: { type: 'rect', data: { x: 0, y: -20, w: CANVAS_WIDTH, h: 1 } } },
    { type: 'moveSpeed', config: { speed: { list: [{ time: 0, value: 600 }] } } },
    { type: 'moveAcceleration', config: { accel: { x: 50, y: 800 }, minStart: 400, maxStart: 600 } },
    { type: 'scale', config: { scale: { list: [{ time: 0, value: 0.02 }, { time: 1, value: 0.01 }] } } },
    { type: 'color', config: { color: { list: [{ time: 0, value: 'aaccff' }, { time: 1, value: '6699cc' }] } } },
    { type: 'alpha', config: { alpha: { list: [{ time: 0, value: 0.6 }, { time: 1, value: 0 }] } } },
  ],
};
```

**Step 2: Wire into OverworldCanvas**

In `src/components/Overworld/OverworldCanvas.tsx`:
1. Import `WeatherParticles`
2. Accept `season` prop
3. Render `<WeatherParticles season={season} />` above `DayNightOverlay`

Pass `season` from `useAtmosphere()` in `Overworld/index.tsx`.

**Step 3: Run tests and build**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test`
Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run build`

**Step 4: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/components/Overworld/WeatherParticles.tsx src/components/Overworld/OverworldCanvas.tsx src/components/Overworld/index.tsx package.json bun.lockb
git commit -m "feat: add seasonal weather particles via @pixi/particle-emitter"
```

---

### Task 9: Seasonal Terrain Tinting

**Files:**
- Create: `src/components/Overworld/SeasonalFilters.tsx`
- Modify: `src/components/Overworld/OverworldCanvas.tsx`

**Step 1: Create seasonal color filters**

Create `src/components/Overworld/SeasonalFilters.tsx`:

Apply a PixiJS `ColorMatrixFilter` to the terrain/tree layer based on season:

- **Spring**: Slight green boost, warm tint
- **Summer**: Saturated, bright
- **Fall**: Shift greens toward orange/gold (hue rotation + desaturation)
- **Winter**: Desaturate significantly, cool blue tint, increase brightness

The filter applies to the `<OverworldMap>` and `<AmbientEffects>` (trees) by wrapping them in a `<container>` with the filter attached.

```tsx
import { useMemo } from 'react';
import { ColorMatrixFilter } from 'pixi.js';
import type { Season } from '../Atmosphere/types';

export function useSeasonalFilter(season: Season): ColorMatrixFilter {
  return useMemo(() => {
    const filter = new ColorMatrixFilter();
    switch (season) {
      case 'spring':
        filter.saturate(0.1, true);  // slight boost
        break;
      case 'summer':
        filter.saturate(0.2, true);  // vibrant
        break;
      case 'fall':
        filter.hue(25, true);       // shift greens → gold
        filter.saturate(-0.1, true); // slightly muted
        break;
      case 'winter':
        filter.desaturate();         // gray out
        filter.saturate(-0.3, true);
        // Cool blue tint via brightness
        break;
    }
    return filter;
  }, [season]);
}
```

**Step 2: Apply filter in OverworldCanvas**

In `src/components/Overworld/OverworldCanvas.tsx`, wrap terrain + trees in a `<container>` with the seasonal filter:

```tsx
import { useSeasonalFilter } from './SeasonalFilters';

// In component body:
const seasonFilter = useSeasonalFilter(season);

// In JSX:
<container filters={[seasonFilter]}>
  <OverworldMap />
  <AmbientEffects />
</container>
```

**Step 3: Run tests and build**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test`
Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run build`

**Step 4: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/components/Overworld/SeasonalFilters.tsx src/components/Overworld/OverworldCanvas.tsx
git commit -m "feat: add seasonal color filters to terrain and trees"
```

---

### Task 10: Door Transition Animation

**Files:**
- Create: `src/components/Overworld/DoorTransition.tsx`
- Modify: `src/components/Overworld/index.tsx:206-217`
- Modify: `src/styles/overworld.css`
- Modify: `src/styles/interior.css`

**Step 1: Create DoorTransition PixiJS component**

Create `src/components/Overworld/DoorTransition.tsx`:

This component renders a circular iris-out wipe animation centered on a given point:

```tsx
import { useRef, useCallback, useEffect } from 'react';
import { extend, useTick } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

extend({ Graphics: PixiGraphics });

type Props = {
  active: boolean;
  centerX: number;
  centerY: number;
  onComplete: () => void;
};

const DURATION = 500; // ms

export function DoorTransition({ active, centerX, centerY, onComplete }: Props) {
  const startTime = useRef<number | null>(null);
  const complete = useRef(false);

  useEffect(() => {
    if (active) {
      startTime.current = Date.now();
      complete.current = false;
    } else {
      startTime.current = null;
    }
  }, [active]);

  useTick(() => {
    if (!active || !startTime.current || complete.current) return;
    const elapsed = Date.now() - startTime.current;
    if (elapsed >= DURATION) {
      complete.current = true;
      onComplete();
    }
  });

  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      if (!active || !startTime.current) return;

      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);

      // Max radius to cover entire canvas from center point
      const maxRadius = Math.hypot(
        Math.max(centerX, CANVAS_WIDTH - centerX),
        Math.max(centerY, CANVAS_HEIGHT - centerY)
      );
      const radius = maxRadius * (1 - eased);

      // Draw black rect with circular cutout
      g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      g.fill({ color: 0x000000, alpha: 1 });
      g.circle(centerX, centerY, radius);
      g.cut();
    },
    [active, centerX, centerY]
  );

  if (!active) return null;

  return <graphics draw={draw} zIndex={200} />;
}
```

**Step 2: Integrate into Overworld dialog confirm flow**

In `src/components/Overworld/index.tsx`, modify `handleDialogConfirm`:

1. Add state: `const [doorTransition, setDoorTransition] = useState<{ active: boolean; x: number; y: number; url: string }>({ active: false, x: 0, y: 0, url: '' });`

2. Replace the current `handleDialogConfirm` (lines 206-217):
```typescript
const handleDialogConfirm = useCallback(() => {
  if (!state.dialog.building) return;
  playConfirm();

  const building = state.dialog.building;
  // Set spawn point for return
  localStorage.setItem('overworld-spawn', building.id);

  // Start iris-out transition centered on building entrance
  const cx = building.entranceX * TILE_SIZE + TILE_SIZE / 2;
  const cy = building.entranceY * TILE_SIZE;
  setDoorTransition({ active: true, x: cx, y: cy, url: building.page });

  dispatch({ type: 'CLOSE_DIALOG' });
  playTransition();
}, [state.dialog.building, playConfirm, playTransition]);
```

3. Add transition complete handler:
```typescript
const handleTransitionComplete = useCallback(() => {
  window.location.href = doorTransition.url;
}, [doorTransition.url]);
```

4. Pass transition state to `OverworldCanvas` and render `<DoorTransition>` inside it.

**Step 3: Add fade-in on interior pages**

In `src/styles/interior.css`, add a fade-in animation:

```css
.interior-scene {
  animation: interior-fade-in 0.4s ease-out;
}

@keyframes interior-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .interior-scene {
    animation: none;
  }
}
```

**Step 4: Run tests and build**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test`
Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run build`

**Step 5: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add src/components/Overworld/DoorTransition.tsx src/components/Overworld/index.tsx src/components/Overworld/OverworldCanvas.tsx src/styles/interior.css
git commit -m "feat: add iris-out door transition when entering buildings"
```

---

### Task 11: Replace Legacy Theme System

**Files:**
- Modify: `src/components/ThemeSwitcher.tsx` — gut the 11-theme system, re-export a season picker + dark mode toggle
- Modify: `src/test/components/ThemeSwitcher.test.tsx` — update tests
- Remove: `src/styles/themes/90s.css`, `brutalist.css`, `minimalist.css`, `terminal.css`, `vaporwave.css`
- Modify: `src/styles/theme.css` — remove theme imports

**Note:** This is a larger task. The key insight is that `useThemeSwitcher` consumers (SecretFeatures, ThemeToggle, etc.) call `switchTheme(id)` and `toggleDarkMode()`. We need to:

1. Replace `useThemeSwitcher` internals to delegate to `useAtmosphere`
2. `switchTheme` now maps to `setOverride` with seasons
3. `toggleDarkMode` still toggles dark palette variant
4. Remove theme-specific CSS class additions (brutalist, 90s, etc.)
5. Remove the 5 theme CSS files

**Step 1: Find all consumers of useThemeSwitcher**

Search the codebase for imports of `useThemeSwitcher`, `ThemeSwitcher`, `switchTheme`, and `themes` to know the API surface that must be preserved or migrated.

**Step 2: Update ThemeSwitcher tests**

Rewrite tests to verify the new seasonal behavior:
- Default season (auto from cycle)
- Season override
- Dark mode toggle
- localStorage persistence

**Step 3: Run tests to verify they fail**

**Step 4: Rewrite useThemeSwitcher**

Replace the 11-theme system with:
```typescript
export function useThemeSwitcher() {
  const { season, setOverride, override } = useAtmosphere();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('bjnewman-dark-mode') === 'true';
  });

  useEffect(() => {
    applySeasonPalette(season, isDark);
  }, [season, isDark]);

  const toggleDarkMode = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('bjnewman-dark-mode', String(next));
      return next;
    });
  };

  return {
    currentSeason: season,
    setSeasonOverride: setOverride,
    override,
    toggleDarkMode,
    isDarkMode: isDark,
  };
}
```

**Step 5: Update all consumers** to use the new API.

**Step 6: Delete theme CSS files and remove imports from theme.css**

**Step 7: Run all tests**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test`
Expected: All pass

**Step 8: Build**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run build`

**Step 9: Commit**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add -A  # carefully review staged files first
git commit -m "refactor: replace 11-theme system with seasonal atmosphere"
```

---

### Task 12: Final Integration Testing & Polish

**Files:**
- All modified files

**Step 1: Run full test suite**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run test`

**Step 2: Run linter**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run lint`

**Step 3: Run build**

Run: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev run build`

**Step 4: Manual verification**

Start dev server: `bun --cwd /Users/benjaminnewman/Projects/bjnewman-dev dev`

Verify:
- [ ] Seasons cycle visually (~2.5 min each)
- [ ] Day/night overlay is smooth and continuous
- [ ] Clouds are varied and numerous
- [ ] Weather particles appear per season
- [ ] Terrain tinting changes with season
- [ ] Duck quack is silent when muted
- [ ] Door iris-out transition plays on building enter
- [ ] Interior pages fade in
- [ ] Holland's page shows the guard notice
- [ ] Season override picker works
- [ ] Dark mode toggle works with seasonal palettes
- [ ] `prefers-reduced-motion` disables animations
- [ ] Mobile virtual d-pad still works

**Step 5: Final commit if any polish needed**

```bash
cd /Users/benjaminnewman/Projects/bjnewman-dev
git add <specific-files>
git commit -m "fix: final polish for atmosphere system"
```
