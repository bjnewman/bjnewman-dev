# Interior Scenes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform all 7 inner pages into RPG-themed interior scenes with pixel-art tiled backgrounds, static character sprite, and content in opaque RPG-styled panels.

**Architecture:** Shared `InteriorScene` React layout component wraps each page. CSS tiled backgrounds (not PixiJS canvas) create the interior scene. Existing page content renders inside `RPGPanel` components. A `DoorButton` provides fade-to-black navigation back to the overworld.

**Tech Stack:** Astro 5, React 19, CSS (BEM), Tiny Swords UI assets, Mana Seed character sprite, Vitest + Playwright browser mode, Bun

**Design doc:** `docs/plans/2026-02-24-interior-scenes-design.md`

**Project root:** `/Users/benjaminnewman/Projects/bjnewman-dev`

---

## Prereqs & Conventions

- **Test runner:** `bun run test` (Vitest with Playwright browser mode). NOT `bun test`.
- **Linter:** `bun run lint` (oxlint)
- **Type check:** `bun run typecheck`
- **Build:** `bun run build`
- **Package manager:** `bun` only. Never npm/yarn/pnpm.
- **VCS:** `jj` (Jujutsu) in colocated mode. Use `jj commit -m "msg"`.
- **Commit format:** `<type>(<scope>): <description>`. Under 80 chars. No period. No LLM attribution.
- **CSS:** BEM naming. `rem` for sizing/spacing, `px` for borders. CSS files for static styles.
- **Accessibility:** Respect `prefers-reduced-motion`. ARIA labels. Keyboard navigation.
- **Tests:** Vitest + @testing-library/react. Tests in `src/test/components/`. Import from `vitest` for describe/it/expect/vi.
- **Existing components are NOT modified** — they render inside RPGPanels unchanged.
- **Reference the latest `mapData.ts`** for current building IDs and names — they may differ from the design doc.

---

## Task 1: Interior Types

**Files:**
- Create: `src/components/Interior/types.ts`

**Step 1: Write the types file**

```typescript
export type InteriorSceneProps = {
  buildingId: string;
  title: string;
  children: React.ReactNode;
  interactiveObjects?: InteractiveObjectDef[];
};

export type InteractiveObjectDef = {
  id: string;
  label: string;
  x: string;
  y: string;
  width: string;
  height: string;
  onClick: () => void;
};

export type SceneConfig = {
  wallTilePattern: string;
  floorTilePattern: string;
  props: SceneProp[];
  characterX: string;
  characterY: string;
  characterDirection: 'down' | 'left' | 'right' | 'up';
};

export type SceneProp = {
  src: string;
  x: string;
  y: string;
  width: string;
  height: string;
  zIndex?: number;
};

export type RPGPanelVariant = 'paper' | 'wood';
```

**Step 2: Verify typecheck**

```bash
bun run typecheck
```

Expected: No new errors.

**Step 3: Commit**

```bash
jj commit -m "feat(interior): add interior scene types"
```

---

## Task 2: Scene Configurations

**Files:**
- Create: `src/components/Interior/sceneConfigs.ts`
- Create: `src/test/components/Interior/sceneConfigs.test.ts`

**Step 1: Write the failing test**

Create `src/test/components/Interior/sceneConfigs.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { sceneConfigs } from '../../../components/Interior/sceneConfigs';

describe('sceneConfigs', () => {
  const expectedBuildings = [
    'town-hall', 'workshop', 'library',
    'courthouse', 'observatory', 'dog-house', 'fairy-treehouse',
  ];

  it('should have a config for each building', () => {
    for (const id of expectedBuildings) {
      expect(sceneConfigs[id]).toBeDefined();
    }
  });

  it('should have wallTilePattern and floorTilePattern for each config', () => {
    for (const id of expectedBuildings) {
      const config = sceneConfigs[id];
      expect(config.wallTilePattern).toBeTruthy();
      expect(config.floorTilePattern).toBeTruthy();
    }
  });

  it('should have character position for each config', () => {
    for (const id of expectedBuildings) {
      const config = sceneConfigs[id];
      expect(config.characterX).toBeTruthy();
      expect(config.characterY).toBeTruthy();
      expect(['down', 'left', 'right', 'up']).toContain(config.characterDirection);
    }
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Interior/sceneConfigs.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write sceneConfigs.ts**

Create `src/components/Interior/sceneConfigs.ts`:

```typescript
import type { SceneConfig } from './types';

// Wall and floor patterns use CSS background properties
// referencing the Tiny Swords tilemap and wall tiles
const WALL_STONE = 'url(/assets/overworld/terrain/tilemap.png) 0 0 / 64px 64px repeat';
const WALL_WOOD = 'url(/assets/overworld/terrain/tilemap.png) -128px 0 / 64px 64px repeat';
const FLOOR_STONE = 'url(/assets/overworld/terrain/tilemap.png) -320px 0 / 64px 64px repeat';
const FLOOR_WOOD = 'url(/assets/overworld/terrain/tilemap.png) -192px 0 / 64px 64px repeat';

// Warm tinted overlays for interior feel
const WARM_TINT = 'linear-gradient(rgba(40, 30, 20, 0.3), rgba(40, 30, 20, 0.5))';
const MAGIC_TINT = 'linear-gradient(rgba(60, 20, 80, 0.2), rgba(30, 10, 50, 0.4))';

export const sceneConfigs: Record<string, SceneConfig> = {
  'town-hall': {
    wallTilePattern: `${WARM_TINT}, ${WALL_STONE}`,
    floorTilePattern: FLOOR_WOOD,
    props: [
      { src: '/assets/overworld/ui/banner.png', x: '40%', y: '5%', width: '20%', height: 'auto' },
    ],
    characterX: '15%',
    characterY: '75%',
    characterDirection: 'right',
  },
  'workshop': {
    wallTilePattern: `${WARM_TINT}, ${WALL_WOOD}`,
    floorTilePattern: FLOOR_STONE,
    props: [],
    characterX: '20%',
    characterY: '70%',
    characterDirection: 'right',
  },
  'library': {
    wallTilePattern: `${WARM_TINT}, ${WALL_WOOD}`,
    floorTilePattern: FLOOR_WOOD,
    props: [],
    characterX: '10%',
    characterY: '75%',
    characterDirection: 'right',
  },
  'courthouse': {
    wallTilePattern: `${WARM_TINT}, ${WALL_STONE}`,
    floorTilePattern: FLOOR_STONE,
    props: [
      { src: '/assets/overworld/ui/banner.png', x: '35%', y: '3%', width: '30%', height: 'auto' },
    ],
    characterX: '15%',
    characterY: '80%',
    characterDirection: 'right',
  },
  'observatory': {
    wallTilePattern: `${WARM_TINT}, ${WALL_STONE}`,
    floorTilePattern: FLOOR_STONE,
    props: [],
    characterX: '25%',
    characterY: '70%',
    characterDirection: 'right',
  },
  'dog-house': {
    wallTilePattern: `${WARM_TINT}, ${WALL_WOOD}`,
    floorTilePattern: FLOOR_WOOD,
    props: [],
    characterX: '20%',
    characterY: '75%',
    characterDirection: 'down',
  },
  'fairy-treehouse': {
    wallTilePattern: `${MAGIC_TINT}, ${WALL_WOOD}`,
    floorTilePattern: FLOOR_WOOD,
    props: [],
    characterX: '15%',
    characterY: '75%',
    characterDirection: 'right',
  },
};
```

**Note to implementer:** The tile background offsets above are approximations. Inspect the actual `tilemap.png` (576x384, 9x6 grid of 64px tiles) to pick the correct tile positions. The left half is grass variants, the right half is cliff/elevated tiles. You may need to extract individual wall/floor tiles as separate small PNGs for cleaner CSS patterns, or use `background-position` to select specific tiles from the spritesheet.

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Interior/sceneConfigs.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(interior): add per-building scene configurations"
```

---

## Task 3: RPGPanel Component

**Files:**
- Create: `src/components/Interior/RPGPanel.tsx`
- Create: `src/test/components/Interior/RPGPanel.test.tsx`
- Create: `src/styles/interior.css`

**Step 1: Write the failing test**

Create `src/test/components/Interior/RPGPanel.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RPGPanel } from '../../../components/Interior/RPGPanel';

describe('RPGPanel', () => {
  it('should render children', () => {
    render(<RPGPanel>Hello World</RPGPanel>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should apply paper variant by default', () => {
    const { container } = render(<RPGPanel>Content</RPGPanel>);
    expect(container.firstChild).toHaveClass('rpg-panel--paper');
  });

  it('should apply wood variant when specified', () => {
    const { container } = render(<RPGPanel variant="wood">Content</RPGPanel>);
    expect(container.firstChild).toHaveClass('rpg-panel--wood');
  });

  it('should have the base rpg-panel class', () => {
    const { container } = render(<RPGPanel>Content</RPGPanel>);
    expect(container.firstChild).toHaveClass('rpg-panel');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Interior/RPGPanel.test.tsx
```

Expected: FAIL.

**Step 3: Create interior.css**

Create `src/styles/interior.css` — this file will grow as we add components:

```css
/* ==========================================================================
   Interior Scene Styles
   ========================================================================== */

/* Scene background (full viewport) */
.interior-scene {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.interior-scene__background {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: 64px 64px;
  background-repeat: repeat;
}

.interior-scene__floor {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30vh;
  z-index: 1;
  background-size: 64px 64px;
  background-repeat: repeat;
}

/* Character sprite (static) */
.interior-scene__character {
  position: fixed;
  z-index: 5;
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
  pointer-events: none;
}

/* Content area (scrollable, above scene) */
.interior-scene__content {
  position: relative;
  z-index: 10;
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* Scene title banner */
.interior-scene__title {
  text-align: center;
  margin-bottom: 2rem;
}

/* ---------- RPG Panel ---------- */
.rpg-panel {
  position: relative;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  color: #2a1a0a;
  line-height: 1.7;
}

.rpg-panel--paper {
  background: #f5e6c8;
  border: 3px solid #c4a46a;
  box-shadow:
    inset 0 0 20px rgba(150, 120, 70, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.3);
}

.rpg-panel--wood {
  background: #8b6d4c;
  border: 3px solid #5c4033;
  color: #f0e6d0;
  box-shadow:
    inset 0 0 20px rgba(60, 40, 20, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.3);
}

.rpg-panel h1,
.rpg-panel h2,
.rpg-panel h3 {
  font-family: 'JetBrains Mono', monospace;
  color: #4a2c0a;
}

.rpg-panel--wood h1,
.rpg-panel--wood h2,
.rpg-panel--wood h3 {
  color: #f5e6c8;
}

.rpg-panel a {
  color: #6a3d0a;
  text-decoration: underline;
}

.rpg-panel--wood a {
  color: #e0c97f;
}

/* ---------- RPG Banner ---------- */
.rpg-banner {
  display: inline-block;
  padding: 0.5rem 2rem;
  background: #c4a46a;
  border: 2px solid #8b6d4c;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2a1a0a;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* ---------- RPG Button ---------- */
.rpg-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  background: #4a8bcc;
  border: 2px solid #2a5a8a;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.1s;
  box-shadow: 0 3px 0 #2a5a8a;
}

.rpg-button:hover {
  background: #5a9bdc;
}

.rpg-button:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #2a5a8a;
}

.rpg-button--active {
  background: #2a5a8a;
  box-shadow: 0 1px 0 #1a3a5a;
  transform: translateY(2px);
}

/* ---------- Door Button ---------- */
.door-button {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(26, 26, 46, 0.9);
  border: 2px solid #e0c97f;
  border-radius: 4px;
  color: #e0c97f;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.door-button:hover,
.door-button:focus-visible {
  background: rgba(26, 26, 46, 1);
}

.door-button__icon {
  font-size: 1.1rem;
}

/* ---------- Interactive Object Hotspot ---------- */
.interactive-object {
  position: fixed;
  z-index: 8;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.interactive-object:hover,
.interactive-object:focus-visible {
  border-color: rgba(224, 201, 127, 0.6);
  box-shadow: 0 0 12px rgba(224, 201, 127, 0.3);
}

.interactive-object__tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.5rem;
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid #e0c97f;
  border-radius: 2px;
  color: #e0c97f;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.interactive-object:hover .interactive-object__tooltip,
.interactive-object:focus-visible .interactive-object__tooltip {
  opacity: 1;
}

/* ---------- Fade Overlay ---------- */
.interior-scene__fade {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: black;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.interior-scene__fade--active {
  opacity: 1;
  pointer-events: all;
}

/* ---------- Reduced Motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .interior-scene__fade {
    transition: none;
  }

  .rpg-button {
    transition: none;
  }

  .interactive-object,
  .interactive-object__tooltip {
    transition: none;
  }
}
```

**Step 4: Write RPGPanel.tsx**

Create `src/components/Interior/RPGPanel.tsx`:

```typescript
import type { RPGPanelVariant } from './types';

type Props = {
  variant?: RPGPanelVariant;
  children: React.ReactNode;
  className?: string;
};

export function RPGPanel({ variant = 'paper', children, className = '' }: Props) {
  return (
    <div className={`rpg-panel rpg-panel--${variant} ${className}`.trim()}>
      {children}
    </div>
  );
}
```

**Step 5: Run test to verify it passes**

```bash
bun run test -- src/test/components/Interior/RPGPanel.test.tsx
```

Expected: PASS.

**Step 6: Commit**

```bash
jj commit -m "feat(interior): add RPGPanel component and interior CSS"
```

---

## Task 4: RPGBanner and RPGButton Components

**Files:**
- Create: `src/components/Interior/RPGBanner.tsx`
- Create: `src/components/Interior/RPGButton.tsx`
- Create: `src/test/components/Interior/RPGBanner.test.tsx`
- Create: `src/test/components/Interior/RPGButton.test.tsx`

**Step 1: Write failing tests**

Create `src/test/components/Interior/RPGBanner.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RPGBanner } from '../../../components/Interior/RPGBanner';

describe('RPGBanner', () => {
  it('should render title text', () => {
    render(<RPGBanner>The Library</RPGBanner>);
    expect(screen.getByText('The Library')).toBeInTheDocument();
  });

  it('should render as a heading', () => {
    render(<RPGBanner>Title</RPGBanner>);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
```

Create `src/test/components/Interior/RPGButton.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RPGButton } from '../../../components/Interior/RPGButton';

describe('RPGButton', () => {
  it('should render label text', () => {
    render(<RPGButton onClick={() => {}}>Click Me</RPGButton>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<RPGButton onClick={onClick}>Click</RPGButton>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should apply active class when active', () => {
    render(<RPGButton onClick={() => {}} active>Tab</RPGButton>);
    expect(screen.getByRole('button')).toHaveClass('rpg-button--active');
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
bun run test -- src/test/components/Interior/RPGBanner.test.tsx src/test/components/Interior/RPGButton.test.tsx
```

Expected: FAIL.

**Step 3: Write RPGBanner.tsx**

```typescript
type Props = {
  children: React.ReactNode;
};

export function RPGBanner({ children }: Props) {
  return <h1 className="rpg-banner">{children}</h1>;
}
```

**Step 4: Write RPGButton.tsx**

```typescript
type Props = {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  className?: string;
};

export function RPGButton({ children, onClick, active = false, className = '' }: Props) {
  return (
    <button
      type="button"
      className={`rpg-button ${active ? 'rpg-button--active' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**Step 5: Run tests to verify they pass**

```bash
bun run test -- src/test/components/Interior/RPGBanner.test.tsx src/test/components/Interior/RPGButton.test.tsx
```

Expected: PASS.

**Step 6: Commit**

```bash
jj commit -m "feat(interior): add RPGBanner and RPGButton components"
```

---

## Task 5: DoorButton Component

**Files:**
- Create: `src/components/Interior/DoorButton.tsx`
- Create: `src/test/components/Interior/DoorButton.test.tsx`

**Step 1: Write the failing test**

Create `src/test/components/Interior/DoorButton.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DoorButton } from '../../../components/Interior/DoorButton';

describe('DoorButton', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render with aria-label', () => {
    render(<DoorButton buildingId="library" />);
    expect(screen.getByRole('button', { name: /return to village/i })).toBeInTheDocument();
  });

  it('should set localStorage spawn point on click', async () => {
    const user = userEvent.setup();
    render(<DoorButton buildingId="library" />);
    await user.click(screen.getByRole('button'));
    expect(localStorage.getItem('overworld-spawn')).toBe('library');
  });

  it('should display door icon', () => {
    render(<DoorButton buildingId="library" />);
    expect(screen.getByText('🚪')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Interior/DoorButton.test.tsx
```

Expected: FAIL.

**Step 3: Write DoorButton.tsx**

```typescript
import { useState, useCallback } from 'react';

type Props = {
  buildingId: string;
};

export function DoorButton({ buildingId }: Props) {
  const [fading, setFading] = useState(false);

  const handleClick = useCallback(() => {
    localStorage.setItem('overworld-spawn', buildingId);
    setFading(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 300);
  }, [buildingId]);

  return (
    <>
      <button
        type="button"
        className="door-button"
        onClick={handleClick}
        aria-label="Return to village"
      >
        <span className="door-button__icon">🚪</span>
        <span>Village</span>
      </button>
      <div className={`interior-scene__fade ${fading ? 'interior-scene__fade--active' : ''}`} />
    </>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Interior/DoorButton.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(interior): add DoorButton with fade transition"
```

---

## Task 6: InteractiveObject Component

**Files:**
- Create: `src/components/Interior/InteractiveObject.tsx`
- Create: `src/test/components/Interior/InteractiveObject.test.tsx`

**Step 1: Write the failing test**

Create `src/test/components/Interior/InteractiveObject.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InteractiveObject } from '../../../components/Interior/InteractiveObject';

describe('InteractiveObject', () => {
  it('should render as a button with aria-label', () => {
    render(
      <InteractiveObject
        id="bookshelf"
        label="Browse the bookshelf"
        x="30%" y="40%" width="10%" height="15%"
        onClick={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Browse the bookshelf' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <InteractiveObject
        id="bookshelf"
        label="Browse"
        x="30%" y="40%" width="10%" height="15%"
        onClick={onClick}
      />
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should show tooltip text', () => {
    render(
      <InteractiveObject
        id="bookshelf"
        label="Browse the bookshelf"
        x="30%" y="40%" width="10%" height="15%"
        onClick={() => {}}
      />
    );
    expect(screen.getByText('Browse the bookshelf')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Interior/InteractiveObject.test.tsx
```

Expected: FAIL.

**Step 3: Write InteractiveObject.tsx**

```typescript
type Props = {
  id: string;
  label: string;
  x: string;
  y: string;
  width: string;
  height: string;
  onClick: () => void;
};

export function InteractiveObject({ id, label, x, y, width, height, onClick }: Props) {
  return (
    <button
      type="button"
      className="interactive-object"
      aria-label={label}
      onClick={onClick}
      data-object-id={id}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      <span className="interactive-object__tooltip">{label}</span>
    </button>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Interior/InteractiveObject.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(interior): add InteractiveObject hotspot component"
```

---

## Task 7: InteriorScene Layout Component

**Files:**
- Create: `src/components/Interior/InteriorScene.tsx`
- Create: `src/test/components/Interior/InteriorScene.test.tsx`

**Step 1: Write the failing test**

Create `src/test/components/Interior/InteriorScene.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InteriorScene } from '../../../components/Interior/InteriorScene';

describe('InteriorScene', () => {
  it('should render children content', () => {
    render(
      <InteriorScene buildingId="library" title="The Library">
        <p>Blog content here</p>
      </InteriorScene>
    );
    expect(screen.getByText('Blog content here')).toBeInTheDocument();
  });

  it('should render the door button', () => {
    render(
      <InteriorScene buildingId="library" title="The Library">
        <p>Content</p>
      </InteriorScene>
    );
    expect(screen.getByRole('button', { name: /return to village/i })).toBeInTheDocument();
  });

  it('should render interactive objects when provided', () => {
    render(
      <InteriorScene
        buildingId="library"
        title="The Library"
        interactiveObjects={[
          { id: 'shelf', label: 'Browse shelf', x: '30%', y: '40%', width: '10%', height: '15%', onClick: () => {} },
        ]}
      >
        <p>Content</p>
      </InteriorScene>
    );
    expect(screen.getByRole('button', { name: 'Browse shelf' })).toBeInTheDocument();
  });

  it('should have the interior-scene class', () => {
    const { container } = render(
      <InteriorScene buildingId="library" title="The Library">
        <p>Content</p>
      </InteriorScene>
    );
    expect(container.firstChild).toHaveClass('interior-scene');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Interior/InteriorScene.test.tsx
```

Expected: FAIL.

**Step 3: Write InteriorScene.tsx**

```typescript
import type { InteriorSceneProps } from './types';
import { sceneConfigs } from './sceneConfigs';
import { DoorButton } from './DoorButton';
import { InteractiveObject } from './InteractiveObject';

// Character sprite: idle frame from the Mana Seed spritesheet
// Row 0 col 0 = down, Row 1 col 0 = up, Row 2 col 0 = left, Row 3 col 0 = right
// Each frame is 64x64 in a 512x512 sheet
const DIRECTION_ROW: Record<string, number> = { down: 0, up: 1, left: 2, right: 3 };

function getCharacterStyle(direction: string): React.CSSProperties {
  const row = DIRECTION_ROW[direction] ?? 0;
  return {
    backgroundImage: 'url(/assets/overworld/units/character.png)',
    backgroundPosition: `0px -${row * 64}px`,
    backgroundSize: '512px 512px',
    imageRendering: 'pixelated',
  };
}

export function InteriorScene({
  buildingId,
  title,
  children,
  interactiveObjects = [],
}: InteriorSceneProps) {
  const config = sceneConfigs[buildingId];

  if (!config) {
    // Fallback: render content without scene
    return <div className="interior-scene">{children}</div>;
  }

  return (
    <div className="interior-scene">
      {/* Tiled background */}
      <div
        className="interior-scene__background"
        style={{ background: config.wallTilePattern }}
      />
      <div
        className="interior-scene__floor"
        style={{ background: config.floorTilePattern }}
      />

      {/* Scene props */}
      {config.props.map((prop, i) => (
        <img
          key={i}
          src={prop.src}
          alt=""
          className="interior-scene__prop"
          style={{
            position: 'fixed',
            left: prop.x,
            top: prop.y,
            width: prop.width,
            height: prop.height,
            zIndex: prop.zIndex ?? 3,
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Character */}
      <div
        className="interior-scene__character"
        style={{
          left: config.characterX,
          top: config.characterY,
          ...getCharacterStyle(config.characterDirection),
        }}
        aria-hidden="true"
      />

      {/* Interactive objects */}
      {interactiveObjects.map((obj) => (
        <InteractiveObject key={obj.id} {...obj} />
      ))}

      {/* Content */}
      <div className="interior-scene__content">
        <div className="interior-scene__title">
          <span className="rpg-banner">{title}</span>
        </div>
        {children}
      </div>

      {/* Door button */}
      <DoorButton buildingId={buildingId} />
    </div>
  );
}

export default InteriorScene;
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Interior/InteriorScene.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(interior): add InteriorScene layout component"
```

---

## Task 8: Update Overworld Spawn from localStorage

**Files:**
- Modify: `src/components/Overworld/gameReducer.ts`
- Modify: `src/components/Overworld/index.tsx` (or wherever initialGameState is consumed)

**Step 1: Write the failing test**

Add to `src/test/components/Overworld/gameReducer.test.ts`:

```typescript
it('should spawn at building entrance when overworld-spawn is set', () => {
  localStorage.setItem('overworld-spawn', 'library');
  // Re-import to get fresh initialGameState
  // This test verifies the getInitialGameState function
});
```

**Note to implementer:** The exact approach depends on how the current overworld initializes. The key requirement is:
1. On mount, check `localStorage.getItem('overworld-spawn')`
2. If set, find the building by ID in `mapData.buildings`, use its `entranceX/entranceY * TILE_SIZE` as spawn position
3. Clear the localStorage value after reading

This can be done in the Overworld `index.tsx`'s `useEffect` on mount, or by making `initialGameState` a function that reads localStorage. The implementer should choose the approach that fits the current code best.

**Step 2: Implement the spawn logic**

**Step 3: Run all overworld tests**

```bash
bun run test -- src/test/components/Overworld/
```

Expected: All pass.

**Step 4: Commit**

```bash
jj commit -m "feat(overworld): spawn at building entrance on return"
```

---

## Task 9: Convert About Page to Interior Scene

**Files:**
- Modify: `src/pages/about.astro`

**Step 1: Update about.astro**

Replace the page content to use InteriorScene + RPGPanels. Keep ALL existing content — just wrap it:

```astro
---
import Base from '../layouts/Base.astro';
import InteriorScene from '../components/Interior/InteriorScene';
import { RPGPanel } from '../components/Interior/RPGPanel';
import { ContactForm } from '../components/ContactForm';
import { PlacesMap } from '../components/PlacesMap';
import { PageCollectible } from '../components/ScavengerHunt';
import '../styles/interior.css';
import '../styles/contact-form.css';
import '../styles/fun-form-fields.css';
import '../styles/places-map.css';
---

<Base title="About">
  <InteriorScene buildingId="town-hall" title="Town Hall" client:load>
    <RPGPanel client:load>
      <h2>The Short Version</h2>
      <p>I'm a full-stack developer specializing in React and Java...</p>
      <!-- rest of about content, same as current -->
    </RPGPanel>

    <RPGPanel client:load>
      <h2>The Journey</h2>
      <PlacesMap client:visible />
    </RPGPanel>

    <RPGPanel client:load>
      <h2>Let's Connect</h2>
      <ContactForm client:visible />
    </RPGPanel>
  </InteriorScene>
</Base>
```

**Important:** Preserve ALL existing text content. Only wrap sections in RPGPanel components. The `client:load` on InteriorScene is needed for the DoorButton interactivity.

**Step 2: Verify dev server renders**

```bash
bun dev
```

Open `http://localhost:4321/about` and verify:
- [ ] Tiled background visible around edges
- [ ] Character sprite visible
- [ ] Content readable in parchment panels
- [ ] Door button visible and clickable
- [ ] Clicking door button fades and navigates to /

**Step 3: Run all tests**

```bash
bun run test
```

**Step 4: Commit**

```bash
jj commit -m "feat(interior): convert about page to interior scene"
```

---

## Task 10: Convert Projects Page

**Files:**
- Modify: `src/pages/projects.astro`

Same pattern as Task 9. Wrap content in `<InteriorScene buildingId="workshop">` with `RPGPanel` components. Use `variant="wood"` for project cards per the design doc.

**Commit:** `feat(interior): convert projects page to interior scene`

---

## Task 11: Convert Blog Pages

**Files:**
- Modify: `src/pages/blog/index.astro`
- Modify: Blog post layout (if a shared layout exists for `.md` posts)

Wrap the blog listing in `<InteriorScene buildingId="library">`. The blogroll sidebar should also be in an RPGPanel.

For individual blog posts (`.md` files), they use Astro's default markdown layout. Check if there's a custom layout — if not, create one that wraps content in InteriorScene.

**Commit:** `feat(interior): convert blog pages to interior scene`

---

## Task 12: Convert Resume Page

**Files:**
- Modify: `src/pages/resume.astro`

Wrap in `<InteriorScene buildingId="courthouse">`. Keep ResumeTimeline, SkillsGrid, EducationCards inside RPGPanels. The resume is scrollable content, so RPGPanels scroll naturally.

**Commit:** `feat(interior): convert resume page to interior scene`

---

## Task 13: Convert Dashboard Page

**Files:**
- Modify: `src/pages/dashboard.astro`

Wrap in `<InteriorScene buildingId="observatory">`. The Dashboard component renders inside an RPGPanel with `variant="wood"`.

**Commit:** `feat(interior): convert dashboard page to interior scene`

---

## Task 14: Convert Carlos Page

**Files:**
- Modify: `src/pages/carlos.astro`

Wrap in `<InteriorScene buildingId="dog-house">`. Move the existing carlos CSS classes to work inside RPGPanels, or simplify the styling since RPGPanel provides the visual treatment.

**Commit:** `feat(interior): convert carlos page to interior scene`

---

## Task 15: Convert Holland Page

**Files:**
- Modify: `src/pages/holland.astro`

Wrap in `<InteriorScene buildingId="fairy-treehouse">`. The existing `<style>` block in holland.astro should be adapted or removed since RPGPanel handles the visual styling. Keep the Holland-specific message styling but adapt colors to work with the RPG theme.

Add interactive object: click a fairy light → toggle Holland sounds (if HollandSounds hook is available).

**Commit:** `feat(interior): convert holland page to interior scene`

---

## Task 16: Integration Testing and Polish

**Files:**
- Run all tests, lint, typecheck, build

**Step 1: Run full test suite**

```bash
bun run test
```

Fix any failures.

**Step 2: Run linter**

```bash
bun run lint
```

**Step 3: Run type checker**

```bash
bun run typecheck
```

**Step 4: Run build**

```bash
bun run build
```

**Step 5: Visual QA with dev server**

```bash
bun dev
```

Test every page:
- [ ] `/about` — Town Hall interior, panels readable, door button works
- [ ] `/projects` — Workshop interior, wood panels
- [ ] `/blog` — Library interior, scrollable post list
- [ ] `/resume` — Courthouse interior, timeline/skills render
- [ ] `/dashboard` — Observatory interior, Visx charts render
- [ ] `/carlos` — Dog House interior, stats and facts display
- [ ] `/holland` — Fairy Treehouse interior, magic tint, sounds
- [ ] Door button on each page → fades → returns to overworld
- [ ] Character spawns at correct building entrance on return
- [ ] `prefers-reduced-motion` disables transitions
- [ ] Keyboard navigation works throughout
- [ ] Content is readable and accessible

**Step 6: Commit final polish**

```bash
jj commit -m "fix(interior): integration polish and fixes"
```

---

## Summary

| Task | Description | Complexity |
|------|-------------|------------|
| 1 | Interior types | Low |
| 2 | Scene configurations | Medium |
| 3 | RPGPanel + CSS | Medium |
| 4 | RPGBanner + RPGButton | Low |
| 5 | DoorButton | Low |
| 6 | InteractiveObject | Low |
| 7 | InteriorScene layout | Medium |
| 8 | Overworld spawn from localStorage | Low |
| 9 | Convert About page | Medium |
| 10 | Convert Projects page | Low |
| 11 | Convert Blog pages | Medium |
| 12 | Convert Resume page | Low |
| 13 | Convert Dashboard page | Low |
| 14 | Convert Carlos page | Low |
| 15 | Convert Holland page | Low |
| 16 | Integration testing + polish | Medium |

**Dependencies:**
- Tasks 1-7 build the shared components (sequential)
- Task 8 modifies the overworld (independent of 1-7 but should come before page conversions)
- Tasks 9-15 are independent page conversions (can be parallelized)
- Task 16 is final integration
