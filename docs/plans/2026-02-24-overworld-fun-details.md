# Overworld & Interior Polish — Enhancement Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement these enhancements.

**Goal:** Bring the overworld village to life with ambient animations, NPCs, easter eggs. Polish interior scenes with atmospheric tints and props. Verify mobile experience.

**Project root:** `/Users/benjaminnewman/Projects/bjnewman-dev`

**Assets available:**
- Decorations: `public/assets/overworld/decorations/` — trees, bushes, rocks, sheep (idle + move), rubber duck, clouds (cloud1-3.png)
- Particles: `public/assets/overworld/particles/` — dust, fire (fire1-3.png)
- Interior tiles: `public/assets/overworld/interior/` — wall and floor textures for 7 buildings
- UI: `public/assets/overworld/ui/` — banners, buttons, paper, ribbons, wood table

---

## Category 1: Ambient Animations

These are PixiJS animations added to the existing overworld canvas.

### 1a. Swaying Trees
- The tree sprites (tree1.png, tree2.png) already have 8 animation frames each (they're spritesheets)
- Cycle through frames slowly (300-400ms per frame) for a gentle sway
- Apply to all tree decorations on the map

### 1b. Drifting Clouds
- Use the Tiny Swords cloud sprites (Clouds_01 through Clouds_08 in the original pack)
- Copy 2-3 cloud PNGs to `public/assets/overworld/decorations/`
- Float them slowly across the top of the canvas (left to right, wrap around)
- Semi-transparent, above buildings but below UI
- Subtle parallax: clouds move independently of the map

### 1c. Water Feature
- If there's a pond or fountain on the map, animate the water foam tiles
- `water-foam.png` has animation frames
- Alternatively, add a small animated fountain using the prop sprites

### 1d. Flickering Torches/Lights
- Add small animated light sprites near building entrances
- Use the fire particle sprites (Fire_01, Fire_02, Fire_03 from the pack)
- Gentle flicker: cycle 2-3 frames at ~200ms

---

## Category 2: NPCs and Animals

### 2a. Carlos the Dog
- Place near the dog house building
- Use the sheep sprite as a base (recolor or swap for a dog sprite if available)
- Idle animation: sitting, occasional head bob
- If player approaches, wag tail (frame swap)

### 2b. Wandering Sheep
- Use `sheep-idle.png` (8 frames of idle animation)
- Place 1-2 sheep in grassy areas
- Simple behavior: idle in place, occasionally face a random direction
- Not blocking — player walks through them

### 2c. Rubber Duck
- Place the rubber duck in a small water area or near a fountain
- Subtle bob animation (translateY oscillation)
- Clicking it could trigger an easter egg (quack sound via jsfxr, or a fun message)

### 2d. NPCs (Future Enhancement)
- Consider adding 1-2 NPC characters (from the Tiny Swords unit sprites)
- Could stand near buildings with speech bubbles showing tips
- "Try pressing Cmd+K for secrets!" / "Visit the Library for blog posts"
- Lower priority than animals

---

## Category 3: Easter Eggs and Secrets

### 3a. Hidden Path
- A partially hidden path (e.g., behind trees) leading to a small clearing
- Could contain a collectible tied to the existing ScavengerHunt system
- The path isn't immediately obvious — reward for exploration

### 3b. Konami Code
- Typing ↑↑↓↓←→←→BA triggers something special
- Options: confetti burst, screen shake, secret NPC appears, special sound
- Can reuse the existing ConfettiCannon component

### 3c. Clickable Well/Fountain
- A well or fountain in the village center
- Clicking it plays a coin-drop sound (jsfxr) and shows a brief "Make a wish!" message
- Could track wishes in localStorage as a fun counter

### 3d. Day/Night Cycle (Ambitious)
- Based on the user's local time, tint the overworld:
  - Morning (6-10): warm golden tint
  - Day (10-17): normal
  - Evening (17-20): orange/pink sunset tint
  - Night (20-6): dark blue tint with star particles
- Pure CSS filter overlay on the canvas, no gameplay impact
- Purely cosmetic but very atmospheric

### 3e. Seasonal Decorations
- Based on current date, swap/add decorations:
  - Winter: snow particles, frosted trees
  - Spring: flowers, bright colors
  - Halloween: pumpkins near buildings
  - Holiday: lights on buildings
- Low priority but high charm

---

## Implementation Notes

- All of these are additions to the existing PixiJS canvas rendering in `OverworldCanvas.tsx` and related components
- Animated sprites use PixiJS `AnimatedSprite` (same pattern as PlayerSprite)
- Cloud/NPC movement uses `useTick()` for per-frame updates
- Easter eggs can be wired through the existing `useInput` hook (for keyboard codes) or pointer events on the canvas
- None of these require architectural changes — they're additive features
- Each is independently implementable and commitable
- Test: Visual QA via dev server is primary; unit tests for easter egg triggers

---

## Category 4: Interior Visual Polish

These enhance the interior scene pages (which use `InteriorBase.astro`).

### 4a. Warm Tint Overlays
- Add a semi-transparent CSS gradient overlay on top of the tiled background for interior warmth
- In `sceneConfigs.ts`, change wallTilePattern to composite: `linear-gradient(rgba(40, 30, 20, 0.3), rgba(40, 30, 20, 0.5)), url(/assets/overworld/interior/wall-stone-warm.png)`
- Fairy Treehouse gets a magic tint: `linear-gradient(rgba(60, 20, 80, 0.2), rgba(30, 10, 50, 0.4))`
- Note: InteriorBase.astro uses `style={`background-image: ...`}` — the composite gradient+url works with backgroundImage

### 4b. Interior Props
- Add positioned prop images inside each interior scene via `sceneConfigs.ts` props array
- Town Hall: banner on wall, table in center
- Workshop: anvil, tool rack
- Library: bookshelf sprites on walls
- Courthouse: banner, columns
- Observatory: telescope prop
- Dog House: dog bowl, toy
- Fairy Treehouse: sparkle/glow effects
- Props use the Tiny Swords TX Props.png sprites — extract individual prop images if needed

### 4c. Character Pose Variety
- Currently all interiors show the character in idle frame facing right
- Adjust `characterDirection` per scene for variety (some facing down, some facing right)
- Consider using a different frame (e.g., wave pose for Holland page if available)

### 4d. Interior Ambient Effects (CSS)
- Subtle CSS animations on interior pages:
  - Fairy Treehouse: floating sparkle particles (CSS keyframe animation)
  - Observatory: slowly rotating star chart (CSS transform rotate)
  - Workshop: warm glow near forge area (CSS radial gradient)
- All respect `prefers-reduced-motion`

---

## Category 5: Mobile Testing & Fixes

Verify the complete experience on mobile devices and fix any issues found.

### 5a. Overworld Mobile Check
- Virtual d-pad renders on touch devices (`@media (pointer: coarse)`)
- Character moves smoothly with d-pad buttons
- Interact button (E) works to open building dialogs
- Building dialog buttons are tap-friendly (min 44px touch targets)
- Title card banner readable on small screens
- Canvas scales properly on various screen sizes

### 5b. Interior Pages Mobile Check
- Tiled backgrounds render correctly on mobile viewports
- RPGPanels don't overflow horizontally
- Door button is reachable and tap-friendly
- Content scrolls smoothly over fixed background
- Character sprite doesn't overlap content on small screens
- All interactive components (ContactForm, PlacesMap, Dashboard charts) work on touch

### 5c. Responsive Fixes
- If RPGPanels are too wide on mobile, add `max-width: 100%` and responsive padding
- If the door button overlaps content, adjust position for mobile
- If text in RPGPanels is too small, increase font-size at mobile breakpoint
- Blog post code blocks should not overflow panels on mobile
- Add mobile-specific breakpoints to `interior.css` if needed

### 5d. Touch Interaction Polish
- Ensure all interactive objects have adequate touch targets (min 44x44px per WCAG)
- Verify hover tooltips on interactive objects work on touch (first tap shows tooltip, second tap activates)
- DoorButton should not accidentally trigger from scroll gestures

---

## Implementation Notes

- All overworld enhancements are additions to existing PixiJS canvas rendering
- Animated sprites use PixiJS `AnimatedSprite` (same pattern as PlayerSprite)
- Cloud/NPC movement uses `useTick()` for per-frame updates
- Easter eggs wire through `useInput` hook or pointer events
- Interior polish is CSS-only changes to `sceneConfigs.ts` and `interior.css`
- Mobile fixes are CSS responsive adjustments
- Each item is independently implementable and commitable
- Test: Visual QA via dev server is primary; unit tests for easter egg triggers

## Priority Order (Recommended)

**Phase A: Overworld Life (highest impact)**
1. Swaying trees — easiest, biggest visual impact
2. Drifting clouds — atmosphere
3. Carlos near the dog house — personality
4. Flickering torches — ambiance

**Phase B: Interior Polish**
5. Warm tint overlays — quick win, big atmosphere improvement
6. Interior props — scene detail
7. Character pose variety — minor touch

**Phase C: Easter Eggs**
8. Rubber duck easter egg — fun
9. Konami code — delight
10. Clickable well/fountain — charm

**Phase D: Mobile**
11. Mobile testing pass — verify everything works
12. Responsive fixes — fix what's broken
13. Touch interaction polish — refinement

**Phase E: Ambitious (if time)**
14. Day/night cycle
15. Wandering sheep
16. Seasonal decorations
