# RPG Overworld Navigation — Design Document

**Date:** 2026-02-23
**Status:** Approved

## Overview

Replace the bjnewman.dev homepage with an interactive pixel-art RPG overworld village. A 32x32 sprite character navigates a single-screen top-down tile map, visiting buildings that represent site pages. Approaching a building triggers an RPG-style dialog preview; confirming navigates to the page.

## Requirements

### Core
- Single-screen top-down pixel art village as homepage (`/`)
- 7 buildings representing site pages
- Player character with 4-direction walk cycle (32x32 sprites)
- Keyboard (WASD/arrows) + click-to-move input (A* pathfinding)
- Mobile: virtual d-pad + tap-to-move
- Proximity detection triggers building highlight + interaction prompt
- RPG dialog box preview with page name, description, confirm/cancel
- Fade-to-black transition on confirm, then Astro navigation
- "Return to Village" link on all inner pages

### Art Assets
- Free/open-source tilesets (itch.io, OpenGameArt, etc.)
- 32x32 pixel tile and sprite size
- Base canvas: 20x15 tiles = 640x480, scaled with `image-rendering: pixelated`

### Audio
- jsfxr-generated sound effects (already a dependency)
- Sounds only for intentional interactions:
  - Dialog open (ascending sweep)
  - Confirm/enter (two-note ascending melody)
  - Cancel/close (descending sweep)
  - Page transition (whoosh)
- No footstep or proximity sounds
- Muted by default, toggle in corner, state in localStorage

### Theme Integration
- Overworld has its own fixed retro aesthetic (no theme switching)
- Themes apply only on inner pages
- Secret menu (Cmd+K) remains accessible as overlay

### Accessibility
- ARIA live region announces position and nearby buildings
- Full keyboard navigation (WASD/arrows)
- Tab-based fallback: hidden tabindex'd links cycle through buildings
- `prefers-reduced-motion`: teleport movement, no animation frames, instant dialogs
- Skip link: "Skip to navigation" bypasses game
- High contrast mode: toggle for higher contrast palette, thicker outlines, larger labels (localStorage)
- Text-only fallback: `<noscript>` + "View as text" link shows styled page links list
- Audio descriptions: "Describe scene" button using Web Speech API (`speechSynthesis`)

## Buildings

| Building | Page | Visual Description |
|----------|------|--------------------|
| Town Hall | `/about` | Large central building, prominent entrance |
| Workshop | `/projects` | Forge/crafting shop with anvil details |
| Library | `/blog` | Book-filled building with tall shelves visible |
| Courthouse | `/resume` | Columned official building, distinguished facade |
| Observatory | `/dashboard` | Tower with telescope dome |
| Dog House | `/carlos` | Decorated dog house near Town Hall |
| Fairy Treehouse | `/holland` | Enchanted tree with house built in, sparkles/lights |

**Map layout:** Buildings arranged around a central village square with dirt paths connecting them. Decorative elements: trees, fences, flowers, fountain/well. Character spawns on central path.

## Technical Architecture

### Approach: Hybrid (PixiJS Canvas + React UI Overlay)

Canvas (via PixiJS v8 + @pixi/react) handles tile map and sprite rendering. React components overlay the canvas for dialog boxes, HUD, and accessibility controls. Game state managed in React and passed to Pixi render tree.

### Library: PixiJS v8 + @pixi/react

**Why PixiJS:**
- Declarative React JSX integration via `@pixi/react` (fits Astro Islands)
- Tree-shakeable (~80-100 KB gzipped)
- `@pixi/tilemap` plugin for efficient tile rendering
- `<pixiAnimatedSprite />` for walk cycle animation
- `useTick()` hook replaces manual requestAnimationFrame
- Massive ecosystem for future growth (particles, filters, effects)
- Used in production by Google, Disney, BBC

**What we build ourselves:**
- AABB tile-grid collision detection (~20 lines)
- Keyboard input handler (~20 lines)
- A* pathfinding for click-to-move

### Dependencies (new)

```
pixi.js (v8)
@pixi/react
@pixi/tilemap
```

### Component Structure

```
src/
  components/
    Overworld/
      index.tsx              # <Application> from @pixi/react, orchestrates all
      OverworldMap.tsx        # Tilemap rendering via @pixi/tilemap
      PlayerSprite.tsx        # <pixiAnimatedSprite /> with walk cycle
      BuildingZones.tsx       # Proximity detection zones per building
      OverworldUI.tsx         # React overlay (dialogs, HUD, a11y controls)
      useGameLoop.ts          # useTick() for per-frame updates
      useInput.ts             # Keyboard (WASD/arrows) + pointer/touch
      useCollision.ts         # AABB tile-grid collision
      usePathfinding.ts       # A* for click-to-move
      useSoundEffects.ts      # jsfxr sound generation + playback
      mapData.ts              # 2D tile array + building metadata
      types.ts                # Game state TypeScript types
      constants.ts            # TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, MOVE_SPEED
      AccessibleNav.tsx       # Tab fallback + text-only view + audio desc
      BuildingDialog.tsx      # RPG-style preview popup (pure React)
  styles/
    overworld.css             # Canvas container, dialog, HUD, high-contrast
```

### Page Changes

- `src/pages/index.astro` — Replace content with `<Overworld client:load />`
- `src/layouts/Base.astro` — Add "Return to Village" nav link when not on `/`

### State Management

`useReducer` for game state:

```typescript
type GameState = {
  player: { x: number; y: number; direction: Direction; isMoving: boolean; frame: number }
  nearbyBuilding: Building | null
  dialog: { open: boolean; building: Building | null }
  path: Point[] | null          // click-to-move path
  audio: { muted: boolean }
  highContrast: boolean
}
```

No external state library. All state local to Overworld component.

### Rendering Pipeline

1. `useTick()` fires each frame
2. Process input (keyboard state, click target)
3. Update player position (direct or follow path)
4. Check tile collision → revert if blocked
5. Check building proximity → update nearbyBuilding
6. PixiJS declarative tree re-renders: map tiles → buildings → decorations → player → effects
7. React overlay re-renders only on state changes affecting UI (dialog, proximity)

### Interaction Flow

```
Player moves near building
  → Building gets pulsing highlight (Pixi)
  → "Press E" prompt appears (Pixi text)
  → ARIA: "Near the Library. Press E to interact."

Player presses E (or clicks building)
  → jsfxr: dialog open sound
  → Dialog box appears (React overlay)
  → Shows: building name, description, Enter/Cancel buttons
  → Typewriter text reveal

Player confirms
  → jsfxr: confirm sound
  → 300ms fade-to-black (CSS transition on overlay)
  → Astro navigates to page URL

Player cancels (Escape / Cancel button / click outside)
  → jsfxr: cancel sound
  → Dialog closes, player resumes control
```

### Scaling

Canvas renders at 640x480 base resolution. CSS scales to fill viewport:
- `width: 100%; max-width: 960px` (or viewport-capped)
- `image-rendering: pixelated` preserves crisp pixel art
- Responsive: on very small screens, consider letterboxing or slight zoom

### Performance

- Astro Islands: only the Overworld component hydrates with JS
- PixiJS WebGL renderer (falls back to Canvas2D)
- Tile map rendered once, only player + effects update per frame
- React overlay renders only on state changes (not every frame)
- `prefers-reduced-motion`: skip animation frames entirely
