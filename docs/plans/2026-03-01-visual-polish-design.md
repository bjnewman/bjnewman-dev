# Visual Polish & Atmosphere System Design

**Date**: 2026-03-01
**Scope**: Replace legacy theme system, enhance day/night cycle, add seasonal variations, refactor sound, improve navigation transitions, update Holland's page.

---

## 1. Unified Atmosphere System

Replaces the 11-theme CSS system with a single atmosphere engine that drives all visual state.

### Season Engine
- 4 seasons cycle ~2.5 min each (~10 min full year)
- Smooth palette blending at season boundaries (~15 sec transition)
- State managed via `useAtmosphere` React context: `{ season, timeOfDay, override }`
- User can override season via simplified picker (replaces ThemeSwitcher)
- Override persisted to localStorage

### Day/Night (PixiJS-rendered)
- Replace CSS keyframe `.overworld__daynight` overlay with PixiJS `Graphics` layer
- Smooth continuous color interpolation (no discrete keyframe stops)
- Phases: Dawn > Morning > Midday > Afternoon > Golden Hour > Dusk > Night > Late Night
- Night phase: star particles (small white dots with twinkle animation)
- Optional sun/moon sprite tracking across sky
- Cycle duration ~10 min, respects `prefers-reduced-motion` (pauses at current state)

### Seasonal Overworld Visuals
| Season | Grass | Trees | Ground Decor | Light |
|--------|-------|-------|-------------|-------|
| Spring | Green | Leafy, light green | Flower sprites | Soft warm |
| Summer | Bright green | Full, dark green | None | Bright warm |
| Fall | Gold/orange tint | Orange/red foliage | Falling leaf particles | Amber |
| Winter | White/gray (snow) | Bare/snow-covered | Snow patches | Cool blue |

- Terrain tiles get seasonal color matrix filter
- Trees swap sprite frames per season
- Ground decorations spawned/despawned by season

### Weather & Clouds
- Cloud count: 8-12 instances (up from 3)
- Varied sizes (0.15x-0.5x scale), speeds, opacities
- Cloud density/darkness varies by season
- Particle effects:
  - Spring: light rain
  - Summer: (clear, minimal)
  - Fall: falling leaves
  - Winter: snowfall
- All particles rendered in PixiJS, respect `prefers-reduced-motion`

### Interior Page Palettes
- Each season generates CSS custom property palette (same variable names as current themes)
- Spring: soft greens/pinks | Summer: warm golds/blues | Fall: amber/burgundy | Winter: cool blues/silver
- Interior pages consume variables unchanged -- no component code changes needed
- Dark mode toggle adjusts luminance of seasonal palette

---

## 2. Door Transition System

### Enter Building Flow
1. User confirms "Enter [Building]" in dialog
2. Dialog closes, character pathfinds to entrance tile (if not already there)
3. On arrival: door-open sprite animation on building (2-3 frames, ~300ms)
4. Screen wipe: circular iris-out centered on door OR fade-to-black (~500ms)
5. Astro navigates to interior page
6. Interior page fades in from black (~400ms CSS transition)

### State
- Transition tracked in game reducer: `transitioning: { building, phase }`
- Input disabled during transition (no movement/interaction)
- Pathfinding to entrance triggers transition on arrival via auto-interact

### Back Navigation
- "Exit" door button on interior pages triggers reverse: fade-to-black > navigate to `/` > fade in with character at building entrance

### Assets
- Door animation frames per building (or generic door overlay sprite)

---

## 3. Sound Refactoring

### Central Audio Manager
- `AudioContext` React context wrapping existing `useSoundEffects` logic
- API: `playSound(id)`, `muted`, `toggleMute()`
- All sound sources register through this system
- Mute state persisted to localStorage (shared globally)

### Duck Fix
- Move inline Web Audio quack synthesis from `EasterEggs.tsx` into audio manager
- Duck component calls `playSound('quack')` instead of creating its own oscillator
- Respects global mute toggle

### Weather/Ambient Sounds (future-ready)
- Audio manager supports ambient loops (rain, wind, crickets) alongside one-shots
- All respect mute toggle

---

## 4. Holland's Page Update

### Guard Notice
Add RPG-themed banner at top of Holland page content (above "You found the secret page!"):

> **HALT, TRAVELER!** This page is for Holland and Holland ONLY. All unauthorized visitors must immediately close their eyes, spin around three times, and forget everything they saw. Violators will be turned into frogs.
>
> *(You have been warned.)*

Styled as parchment/scroll banner within existing RPGPanel aesthetic.

---

## Implementation Order (suggested)

1. **Holland's page note** -- smallest, independent change
2. **Sound refactoring** -- small, foundational for later work
3. **Atmosphere context + season engine** -- core state management
4. **PixiJS day/night rendering** -- replace CSS overlay
5. **Seasonal terrain/tree visuals** -- sprite swaps + color filters
6. **Enhanced clouds + weather particles** -- atmospheric polish
7. **Door transition system** -- navigation enhancement
8. **Remove legacy theme system** -- cleanup after atmosphere system is stable
