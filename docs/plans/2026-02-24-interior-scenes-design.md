# RPG Interior Scenes — Design Document

**Date:** 2026-02-24
**Status:** Approved
**Depends on:** Overworld Navigation (must be complete first)

## Overview

Transform all 7 inner pages into RPG-themed interior scenes that maintain the pixel-art immersion established by the overworld homepage. Each page gets a full-viewport tiled pixel-art background (the building's interior), with the player character visible as a static sprite, and actual page content rendered in opaque RPG-styled panels floating over the scene.

**Note:** Building visuals and positions on the overworld may have been updated since the original overworld design doc. The interior concepts and names below are stable, but the implementing agent should reference the latest `mapData.ts` and `buildings` array for current building definitions.

## Requirements

### Core
- All 7 pages get interior scenes (About, Projects, Blog, Resume, Dashboard, Carlos, Holland)
- Full-viewport CSS tiled background per interior (wall tiles, floor tiles, props)
- Player character visible as a static positioned sprite (not controllable)
- Content in opaque RPG-styled panels (Tiny Swords parchment/wood-table UI assets)
- Pixel-art door button (fixed corner) to fade-to-black and return to overworld
- Some pages have interactive objects (clickable hotspots over scene props)
- Content scrolling behavior matched to content type:
  - Blog, Resume: scrollable panels
  - About, Projects: paginated/tabbed sections
  - Dashboard, Carlos, Holland: discrete panel cards

### Art Assets
- Reuse existing Tiny Swords assets (wall tiles, props, UI elements) already in `public/assets/overworld/`
- Interior backgrounds composed from CSS tiled patterns
- Character sprite from `public/assets/overworld/units/character.png` (static idle frame)
- UI elements: `paper.png`, `paper-special.png`, `wood-table.png`, `banner.png`, `button-blue.png`, `button-blue-pressed.png`

### No PixiJS on Inner Pages
- Interior scenes use CSS + HTML + static images only
- PixiJS remains exclusive to the overworld homepage
- This keeps inner pages lightweight and accessible by default

### Transitions
- **Enter building:** Overworld fade-to-black → Astro navigates to page → interior loads immediately
- **Exit building:** DoorButton click → fade-to-black → navigate to `/` → character spawns at that building's entrance on the overworld

### Accessibility
- All existing accessibility features preserved
- RPGPanels are semantic HTML (headings, lists, links)
- Interactive objects are `<button>` elements with proper `aria-label`
- DoorButton has `aria-label="Return to village"`
- `prefers-reduced-motion` disables fade transitions
- Existing skip links, keyboard nav, screen reader support unchanged

### Theme Integration
- Interior scenes have their own fixed retro aesthetic (matching overworld)
- Theme switching (if active) applies to text colors within panels but not to the scene background

## Interior Scene Concepts

### 1. Town Hall → `/about` (Monastery interior)
- **Scene:** Stone walls, wooden floor, large table in center, banners on walls
- **Character:** Standing near the entrance, facing the room
- **Content:** `RPGPanel--paper` with bio text. Paginated into sections (Background, Interests, What I Do) via tabbed RPG buttons
- **Interactive objects:** None

### 2. Workshop → `/projects` (Barracks interior)
- **Scene:** Wooden walls, workbenches, tools on walls, forge glow
- **Character:** Standing near an anvil
- **Content:** `RPGPanel--wood` cards for each project in a grid. ProjectFilter styled with RPG buttons
- **Interactive objects:** Click toolrack → filters to "tools" category

### 3. Library → `/blog` (House1 interior)
- **Scene:** Wall-to-wall bookshelves, reading desk with candle, cozy rug
- **Character:** Standing near a bookshelf
- **Content:** Scrollable `RPGPanel--paper` with blog post list. Individual blog posts also use Library interior
- **Interactive objects:** Click bookshelf → jumps to category/tag

### 4. Courthouse → `/resume` (Castle interior)
- **Scene:** Grand columned hall, official banners, witness stand area
- **Character:** Standing at attention
- **Content:** Scrollable `RPGPanel--paper` with resume timeline, education and skills in separate panels
- **Interactive objects:** Click scroll rack → jumps to education section

### 5. Observatory → `/dashboard` (Tower interior)
- **Scene:** Circular room, telescope, star charts on walls, desk with instruments
- **Character:** Near the telescope
- **Content:** Dashboard panels (Carlos, Holland, Sports) as separate `RPGPanel--wood` cards with existing Visx charts
- **Interactive objects:** Click telescope → opens Chicago Sports section

### 6. Dog House → `/carlos` (House3 interior)
- **Scene:** Cozy interior, dog bed, toys, water bowl
- **Character:** Kneeling/sitting near dog bed
- **Content:** `RPGPanel--paper` with Carlos content
- **Interactive objects:** Click dog bowl → easter egg

### 7. Fairy Treehouse → `/holland` (Archery interior, enchanted)
- **Scene:** Magical tree interior, glowing lights, tiny furniture, sparkles
- **Character:** Standing in whimsical pose
- **Content:** `RPGPanel--paper` with Holland content. HollandDecorations integrated
- **Interactive objects:** Click fairy light → toggles Holland sounds

## Technical Architecture

### Approach: Shared InteriorScene Layout + CSS Backgrounds

A single `InteriorScene` React component serves as the layout for all 7 pages. Interior backgrounds are CSS tiled patterns (not PixiJS canvas). Existing page components render inside RPGPanel wrappers unchanged.

### New Components

```
src/
  components/
    Interior/
      InteriorScene.tsx        # Shared layout: bg + character + panels + door
      RPGPanel.tsx             # Opaque content container (paper/wood variants)
      RPGBanner.tsx            # Section header with banner asset
      RPGButton.tsx            # Styled button with press state
      DoorButton.tsx           # Fixed exit button, fade + navigate to /
      InteractiveObject.tsx    # Positioned hotspot over scene prop
      sceneConfigs.ts          # Per-building scene data (tiles, props, character pos)
      types.ts                 # Interior-specific types
  styles/
    interior.css               # All interior BEM styling
```

### InteriorScene Props

```typescript
type InteriorSceneProps = {
  buildingId: string;
  title: string;
  children: React.ReactNode;
  interactiveObjects?: InteractiveObject[];
};

type InteractiveObject = {
  id: string;
  label: string;       // aria-label and tooltip
  x: string;           // CSS position (e.g., "25%")
  y: string;           // CSS position (e.g., "30%")
  width: string;       // CSS size
  height: string;      // CSS size
  onClick: () => void; // action (scroll to section, toggle, etc.)
};
```

### Scene Configuration

```typescript
// sceneConfigs.ts
type SceneConfig = {
  wallTilePattern: string;     // CSS background for walls
  floorTilePattern: string;    // CSS background for floor
  props: SceneProp[];          // positioned prop images
  characterX: string;          // CSS position
  characterY: string;          // CSS position
  characterDirection: 'down' | 'left' | 'right' | 'up';  // which idle frame
};

type SceneProp = {
  src: string;                 // image path
  x: string;
  y: string;
  width: string;
  height: string;
  zIndex?: number;
};
```

### Page Integration Pattern

Each `.astro` page wraps content in InteriorScene:

```astro
---
import Base from '../layouts/Base.astro';
import InteriorScene from '../components/Interior/InteriorScene';
import RPGPanel from '../components/Interior/RPGPanel';
import RPGBanner from '../components/Interior/RPGBanner';
import '../styles/interior.css';
---

<Base title="About">
  <InteriorScene buildingId="town-hall" title="Town Hall" client:load>
    <RPGBanner>About Ben</RPGBanner>
    <RPGPanel variant="paper">
      <!-- existing about content -->
    </RPGPanel>
  </InteriorScene>
</Base>
```

### RPGPanel Styling

Uses Tiny Swords UI assets as CSS backgrounds:
- `paper.png` → 9-slice CSS `border-image` for parchment panels
- `wood-table.png` → background for wood variant
- `banner.png` → header decoration
- `button-blue.png` / `button-blue-pressed.png` → button states

Panels are opaque (solid background) with the pixel-art scene visible in gaps and around edges.

### DoorButton

Fixed position (lower-left corner). Uses a door sprite from `TX Props.png` (already in assets as part of the props sheet). Click triggers:
1. Fade-to-black overlay (300ms CSS transition)
2. `window.location.href = '/'`
3. Overworld loads with character at the building's entrance (using localStorage to pass `lastBuilding` ID)

### Return-to-Building Spawn

When navigating back to the overworld from an interior, the character should spawn at the building's entrance (not the default center spawn):
- DoorButton sets `localStorage.setItem('overworld-spawn', buildingId)` before navigating
- Overworld's `initialGameState` checks localStorage on mount and spawns at the building entrance if set
- Clear the localStorage value after reading it

### Existing Components Preserved

These components render INSIDE RPGPanels without modification:
- TypewriterCode, StatCards, SkillsGrid (About/Projects)
- ResumeTimeline, EducationCards (Resume)
- Dashboard components: CarlosStation, HollandTimeline, ChicagoSportsIndex (Dashboard)
- ContactForm (About)
- PlacesMap (About)
- HollandDecorations, HollandSounds (Holland)
- ProjectFilter (Projects)
- Blog post markdown rendering (Blog)

### Performance

- No PixiJS on inner pages — CSS backgrounds are lightweight
- Tile pattern images are small and cacheable
- Character sprite is a single static frame extracted or CSS-cropped from the spritesheet
- Interactive objects are standard HTML buttons — no canvas overhead
- Astro Islands: only InteriorScene hydrates, static content remains static
