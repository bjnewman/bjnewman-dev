# Overworld Fun Details — Enhancement Plan

> **For Claude:** These are incremental enhancements to the existing overworld. Each can be implemented independently. No architectural changes needed.

**Goal:** Bring the overworld village to life with ambient animations, wandering NPCs/animals, and hidden easter eggs.

**Project root:** `/Users/benjaminnewman/Projects/bjnewman-dev`

**Assets available:** Check `public/assets/overworld/decorations/` for trees, bushes, rocks, sheep, rubber duck. Check `public/assets/overworld/particles/` for dust effects.

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

## Priority Order (Recommended)

1. **Swaying trees** — easiest, biggest visual impact
2. **Carlos near the dog house** — personality
3. **Drifting clouds** — atmosphere
4. **Rubber duck easter egg** — fun
5. **Konami code** — delight
6. **Day/night cycle** — atmosphere
7. **Everything else** — as time allows
