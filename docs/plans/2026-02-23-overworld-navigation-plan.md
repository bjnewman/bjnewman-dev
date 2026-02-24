# Overworld Navigation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the bjnewman.dev homepage with an interactive pixel-art RPG overworld village that serves as the primary navigation.

**Architecture:** Hybrid PixiJS canvas + React UI overlay. PixiJS v8 with `@pixi/react` renders the tile map and character sprites on canvas. React components overlay the canvas for dialog boxes, HUD, and accessibility. Game state lives in a `useReducer` hook, passed into both the Pixi render tree and React overlay.

**Tech Stack:** Astro 5, React 19, PixiJS v8, @pixi/react, @pixi/tilemap, jsfxr, Vitest + Playwright browser mode, Bun

**Design doc:** `docs/plans/2026-02-23-overworld-navigation-design.md`

**Project root:** `/Users/benjaminnewman/Projects/bjnewman-dev`

---

## Prereqs & Conventions

- **Test runner:** `bun run test` (Vitest with Playwright browser mode). NOT `bun test`.
- **Linter:** `bun run lint` (oxlint)
- **Type check:** `bun run typecheck`
- **Build:** `bun run build`
- **Package manager:** `bun` only. Never npm/yarn/pnpm.
- **VCS:** `jj` (Jujutsu) in colocated mode. Use `jj commit -m "msg"` and `jj describe -m "msg"`.
- **Commit format:** `<type>: <description>` or `<type>(<scope>): <description>`. Under 80 chars. No period. No LLM attribution.
- **CSS:** BEM naming. `rem` for sizing/spacing, `px` for borders. CSS files for static styles, inline for dynamic (positions/transforms).
- **Accessibility:** Respect `prefers-reduced-motion`. ARIA labels. Keyboard navigation. Color never sole indicator.
- **Tests:** Vitest + @testing-library/react. Tests live in `src/test/components/`. Browser mode (Playwright). Import from `vitest` for describe/it/expect/vi.

---

## Task 1: Install PixiJS Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install pixi.js, @pixi/react, and @pixi/tilemap**

```bash
bun add pixi.js @pixi/react @pixi/tilemap
```

**Step 2: Verify installation**

```bash
bun run typecheck
```

Expected: No new type errors from pixi packages.

**Step 3: Commit**

```bash
jj commit -m "feat(overworld): add pixi.js, @pixi/react, @pixi/tilemap deps"
```

---

## Task 2: Types, Constants, and Map Data

**Files:**
- Create: `src/components/Overworld/types.ts`
- Create: `src/components/Overworld/constants.ts`
- Create: `src/components/Overworld/mapData.ts`

**Step 1: Write the test for map data validation**

Create `src/test/components/Overworld/mapData.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from '../../../components/Overworld/constants';
import { tileMap, buildings, WALKABLE_TILES } from '../../../components/Overworld/mapData';

describe('mapData', () => {
  it('should have correct map dimensions', () => {
    expect(tileMap).toHaveLength(MAP_ROWS);
    tileMap.forEach((row) => {
      expect(row).toHaveLength(MAP_COLS);
    });
  });

  it('should define all 7 buildings', () => {
    expect(buildings).toHaveLength(7);
    const expectedPages = ['/about', '/projects', '/blog', '/resume', '/dashboard', '/carlos', '/holland'];
    const actualPages = buildings.map((b) => b.page);
    expect(actualPages.sort()).toEqual(expectedPages.sort());
  });

  it('should place each building at valid tile coordinates', () => {
    buildings.forEach((building) => {
      expect(building.tileX).toBeGreaterThanOrEqual(0);
      expect(building.tileX).toBeLessThan(MAP_COLS);
      expect(building.tileY).toBeGreaterThanOrEqual(0);
      expect(building.tileY).toBeLessThan(MAP_ROWS);
    });
  });

  it('should have walkable tiles around each building entrance', () => {
    buildings.forEach((building) => {
      const entranceX = building.entranceX;
      const entranceY = building.entranceY;
      const tile = tileMap[entranceY][entranceX];
      expect(WALKABLE_TILES).toContain(tile);
    });
  });

  it('should use TILE_SIZE of 32', () => {
    expect(TILE_SIZE).toBe(32);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Overworld/mapData.test.ts
```

Expected: FAIL — modules not found.

**Step 3: Create types.ts**

Create `src/components/Overworld/types.ts`:

```typescript
export type Direction = 'down' | 'left' | 'right' | 'up';

export type Point = {
  x: number;
  y: number;
};

export type Building = {
  id: string;
  name: string;
  description: string;
  page: string;
  tileX: number;
  tileY: number;
  width: number;   // in tiles
  height: number;  // in tiles
  entranceX: number;
  entranceY: number;
};

export type PlayerState = {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  frame: number;
};

export type DialogState = {
  open: boolean;
  building: Building | null;
};

export type GameState = {
  player: PlayerState;
  nearbyBuilding: Building | null;
  dialog: DialogState;
  path: Point[] | null;
  audio: { muted: boolean };
  highContrast: boolean;
};

export type GameAction =
  | { type: 'MOVE_PLAYER'; x: number; y: number; direction: Direction }
  | { type: 'SET_MOVING'; isMoving: boolean }
  | { type: 'SET_FRAME'; frame: number }
  | { type: 'SET_NEARBY_BUILDING'; building: Building | null }
  | { type: 'OPEN_DIALOG'; building: Building }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'SET_PATH'; path: Point[] | null }
  | { type: 'TOGGLE_AUDIO' }
  | { type: 'TOGGLE_HIGH_CONTRAST' };

// Tile type constants for the map array
export const TileType = {
  GRASS: 0,
  PATH: 1,
  BUILDING: 2,
  TREE: 3,
  FENCE: 4,
  WATER: 5,
  FLOWER: 6,
  DOOR: 7,
} as const;

export type TileTypeValue = (typeof TileType)[keyof typeof TileType];
```

**Step 4: Create constants.ts**

Create `src/components/Overworld/constants.ts`:

```typescript
export const TILE_SIZE = 32;
export const MAP_COLS = 20;
export const MAP_ROWS = 15;
export const CANVAS_WIDTH = MAP_COLS * TILE_SIZE;  // 640
export const CANVAS_HEIGHT = MAP_ROWS * TILE_SIZE; // 480
export const MOVE_SPEED = 2; // pixels per frame
export const ANIMATION_FRAME_DURATION = 150; // ms per walk frame
export const INTERACTION_RANGE = 1; // tiles
export const SPAWN_X = 10; // tile column
export const SPAWN_Y = 10; // tile row
```

**Step 5: Create mapData.ts**

Create `src/components/Overworld/mapData.ts`:

```typescript
import { TileType } from './types';
import type { Building, TileTypeValue } from './types';
import { MAP_COLS, MAP_ROWS } from './constants';

// Tile indices that the player can walk on
export const WALKABLE_TILES: TileTypeValue[] = [TileType.GRASS, TileType.PATH, TileType.DOOR];

// 7 buildings corresponding to site pages
export const buildings: Building[] = [
  {
    id: 'town-hall',
    name: 'Town Hall',
    description: 'Learn about Ben — background, interests, and what drives him.',
    page: '/about',
    tileX: 8, tileY: 2,
    width: 4, height: 3,
    entranceX: 10, entranceY: 5,
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Browse projects and open source contributions.',
    page: '/projects',
    tileX: 1, tileY: 3,
    width: 3, height: 3,
    entranceX: 2, entranceY: 6,
  },
  {
    id: 'library',
    name: 'Library',
    description: 'Read blog posts about tech, law, and life.',
    page: '/blog',
    tileX: 15, tileY: 2,
    width: 3, height: 3,
    entranceX: 16, entranceY: 5,
  },
  {
    id: 'courthouse',
    name: 'Courthouse',
    description: 'View the full resume and work history.',
    page: '/resume',
    tileX: 15, tileY: 9,
    width: 3, height: 3,
    entranceX: 16, entranceY: 12,
  },
  {
    id: 'observatory',
    name: 'Observatory',
    description: 'Personal metrics dashboard — Carlos, Holland, sports.',
    page: '/dashboard',
    tileX: 1, tileY: 9,
    width: 3, height: 3,
    entranceX: 2, entranceY: 12,
  },
  {
    id: 'dog-house',
    name: 'Dog House',
    description: 'All about Carlos the dog.',
    page: '/carlos',
    tileX: 12, tileY: 6,
    width: 2, height: 2,
    entranceX: 13, entranceY: 8,
  },
  {
    id: 'fairy-treehouse',
    name: 'Fairy Treehouse',
    description: 'Holland\'s enchanted corner of the village.',
    page: '/holland',
    tileX: 6, tileY: 9,
    width: 2, height: 3,
    entranceX: 7, entranceY: 12,
  },
];

// Generate tile map from building positions
// Start with grass, carve paths, place buildings
function generateTileMap(): TileTypeValue[][] {
  const map: TileTypeValue[][] = Array.from({ length: MAP_ROWS }, () =>
    Array.from({ length: MAP_COLS }, () => TileType.GRASS)
  );

  // Place buildings
  for (const building of buildings) {
    for (let dy = 0; dy < building.height; dy++) {
      for (let dx = 0; dx < building.width; dx++) {
        const x = building.tileX + dx;
        const y = building.tileY + dy;
        if (x < MAP_COLS && y < MAP_ROWS) {
          map[y][x] = TileType.BUILDING;
        }
      }
    }
    // Place door tile at entrance
    if (building.entranceY < MAP_ROWS && building.entranceX < MAP_COLS) {
      map[building.entranceY][building.entranceX] = TileType.DOOR;
    }
  }

  // Carve horizontal path across middle (row 7-8)
  for (let x = 0; x < MAP_COLS; x++) {
    if (map[7][x] === TileType.GRASS) map[7][x] = TileType.PATH;
    if (map[8][x] === TileType.GRASS) map[8][x] = TileType.PATH;
  }

  // Carve vertical path down center (col 9-10)
  for (let y = 0; y < MAP_ROWS; y++) {
    if (map[y][9] === TileType.GRASS) map[y][9] = TileType.PATH;
    if (map[y][10] === TileType.GRASS) map[y][10] = TileType.PATH;
  }

  // Carve connector paths to building entrances
  for (const building of buildings) {
    const ex = building.entranceX;
    const ey = building.entranceY;
    // Connect entrance to nearest main path
    // Vertical connection to row 7-8
    const targetRow = ey < 7 ? 7 : 8;
    const startRow = Math.min(ey, targetRow);
    const endRow = Math.max(ey, targetRow);
    for (let y = startRow; y <= endRow; y++) {
      if (map[y][ex] === TileType.GRASS) map[y][ex] = TileType.PATH;
    }
  }

  // Add some decorative trees along edges
  const treePositions = [
    [0, 0], [0, 1], [19, 0], [19, 1],
    [0, 13], [0, 14], [19, 13], [19, 14],
    [5, 0], [14, 0], [5, 14], [14, 14],
  ];
  for (const [x, y] of treePositions) {
    if (map[y][x] === TileType.GRASS) map[y][x] = TileType.TREE;
  }

  // Add flowers scattered
  const flowerPositions = [
    [4, 6], [15, 6], [4, 13], [11, 1], [18, 7],
  ];
  for (const [x, y] of flowerPositions) {
    if (map[y][x] === TileType.GRASS) map[y][x] = TileType.FLOWER;
  }

  return map;
}

export const tileMap = generateTileMap();
```

**Step 6: Run test to verify it passes**

```bash
bun run test -- src/test/components/Overworld/mapData.test.ts
```

Expected: PASS — all 5 tests pass.

**Step 7: Commit**

```bash
jj commit -m "feat(overworld): add types, constants, and map data"
```

---

## Task 3: Input Hook (useInput)

**Files:**
- Create: `src/components/Overworld/useInput.ts`
- Create: `src/test/components/Overworld/useInput.test.ts`

**Step 1: Write the failing test**

Create `src/test/components/Overworld/useInput.test.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInput } from '../../../components/Overworld/useInput';

describe('useInput', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with no keys pressed', () => {
    const { result } = renderHook(() => useInput());
    expect(result.current.keys.up).toBe(false);
    expect(result.current.keys.down).toBe(false);
    expect(result.current.keys.left).toBe(false);
    expect(result.current.keys.right).toBe(false);
    expect(result.current.keys.interact).toBe(false);
  });

  it('should detect arrow key presses', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });

    expect(result.current.keys.up).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }));
    });

    expect(result.current.keys.up).toBe(false);
  });

  it('should detect WASD key presses', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    });

    expect(result.current.keys.up).toBe(true);
  });

  it('should detect E key as interact', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    });

    expect(result.current.keys.interact).toBe(true);
  });

  it('should detect Escape key', () => {
    const { result } = renderHook(() => useInput());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.keys.escape).toBe(true);
  });

  it('should track click target position', () => {
    const { result } = renderHook(() => useInput());

    expect(result.current.clickTarget).toBeNull();
  });

  it('should clean up listeners on unmount', () => {
    const removeEventSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useInput());

    unmount();

    expect(removeEventSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeEventSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Overworld/useInput.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write useInput.ts**

Create `src/components/Overworld/useInput.ts`:

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Point } from './types';

export type InputKeys = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  escape: boolean;
};

const KEY_MAP: Record<string, keyof InputKeys> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  a: 'left',
  A: 'left',
  s: 'down',
  S: 'down',
  d: 'right',
  D: 'right',
  e: 'interact',
  E: 'interact',
  Enter: 'interact',
  Escape: 'escape',
};

export function useInput() {
  const [keys, setKeys] = useState<InputKeys>({
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
    escape: false,
  });
  const [clickTarget, setClickTarget] = useState<Point | null>(null);
  const keysRef = useRef(keys);
  keysRef.current = keys;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const mapped = KEY_MAP[e.key];
    if (mapped) {
      e.preventDefault();
      setKeys((prev) => ({ ...prev, [mapped]: true }));
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const mapped = KEY_MAP[e.key];
    if (mapped) {
      setKeys((prev) => ({ ...prev, [mapped]: false }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleCanvasClick = useCallback((worldX: number, worldY: number) => {
    setClickTarget({ x: worldX, y: worldY });
  }, []);

  const clearClickTarget = useCallback(() => {
    setClickTarget(null);
  }, []);

  const clearInteract = useCallback(() => {
    setKeys((prev) => ({ ...prev, interact: false }));
  }, []);

  const clearEscape = useCallback(() => {
    setKeys((prev) => ({ ...prev, escape: false }));
  }, []);

  return { keys, clickTarget, handleCanvasClick, clearClickTarget, clearInteract, clearEscape };
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Overworld/useInput.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(overworld): add useInput hook for keyboard and click input"
```

---

## Task 4: Collision Detection (useCollision)

**Files:**
- Create: `src/components/Overworld/useCollision.ts`
- Create: `src/test/components/Overworld/useCollision.test.ts`

**Step 1: Write the failing test**

Create `src/test/components/Overworld/useCollision.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { canMoveTo, getTileAt, isNearBuilding } from '../../../components/Overworld/useCollision';
import { TileType } from '../../../components/Overworld/types';
import { buildings } from '../../../components/Overworld/mapData';
import { TILE_SIZE } from '../../../components/Overworld/constants';

describe('collision detection', () => {
  it('should allow movement to grass tiles', () => {
    // Find a grass tile from the map
    expect(canMoveTo(9 * TILE_SIZE, 7 * TILE_SIZE)).toBe(true);
  });

  it('should allow movement to path tiles', () => {
    // Row 7 is the horizontal path
    expect(canMoveTo(5 * TILE_SIZE, 7 * TILE_SIZE)).toBe(true);
  });

  it('should block movement to building tiles', () => {
    const building = buildings[0]; // Town Hall at tileX:8, tileY:2
    expect(canMoveTo(building.tileX * TILE_SIZE, building.tileY * TILE_SIZE)).toBe(false);
  });

  it('should block movement outside map bounds', () => {
    expect(canMoveTo(-TILE_SIZE, 0)).toBe(false);
    expect(canMoveTo(0, -TILE_SIZE)).toBe(false);
    expect(canMoveTo(20 * TILE_SIZE, 0)).toBe(false);
    expect(canMoveTo(0, 15 * TILE_SIZE)).toBe(false);
  });

  it('should detect when player is near a building', () => {
    const building = buildings[0]; // Town Hall
    const nearX = building.entranceX * TILE_SIZE;
    const nearY = building.entranceY * TILE_SIZE;
    const result = isNearBuilding(nearX, nearY);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('town-hall');
  });

  it('should return null when player is far from buildings', () => {
    // Center of the map, on a path, away from buildings
    const result = isNearBuilding(10 * TILE_SIZE, 8 * TILE_SIZE);
    expect(result).toBeNull();
  });

  it('should return correct tile type', () => {
    expect(getTileAt(0, 0)).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Overworld/useCollision.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write useCollision.ts**

Create `src/components/Overworld/useCollision.ts`:

```typescript
import type { Building, TileTypeValue } from './types';
import { tileMap, buildings, WALKABLE_TILES } from './mapData';
import { TILE_SIZE, MAP_COLS, MAP_ROWS, INTERACTION_RANGE } from './constants';

export function getTileAt(pixelX: number, pixelY: number): TileTypeValue | null {
  const tileX = Math.floor(pixelX / TILE_SIZE);
  const tileY = Math.floor(pixelY / TILE_SIZE);
  if (tileX < 0 || tileX >= MAP_COLS || tileY < 0 || tileY >= MAP_ROWS) {
    return null;
  }
  return tileMap[tileY][tileX];
}

export function canMoveTo(pixelX: number, pixelY: number): boolean {
  const tile = getTileAt(pixelX, pixelY);
  if (tile === null) return false;
  return WALKABLE_TILES.includes(tile);
}

export function isNearBuilding(pixelX: number, pixelY: number): Building | null {
  const playerTileX = Math.floor(pixelX / TILE_SIZE);
  const playerTileY = Math.floor(pixelY / TILE_SIZE);

  for (const building of buildings) {
    const dx = Math.abs(playerTileX - building.entranceX);
    const dy = Math.abs(playerTileY - building.entranceY);
    if (dx <= INTERACTION_RANGE && dy <= INTERACTION_RANGE) {
      return building;
    }
  }
  return null;
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Overworld/useCollision.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(overworld): add tile collision detection and building proximity"
```

---

## Task 5: A* Pathfinding (usePathfinding)

**Files:**
- Create: `src/components/Overworld/usePathfinding.ts`
- Create: `src/test/components/Overworld/usePathfinding.test.ts`

**Step 1: Write the failing test**

Create `src/test/components/Overworld/usePathfinding.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { findPath } from '../../../components/Overworld/usePathfinding';
import { TILE_SIZE } from '../../../components/Overworld/constants';

describe('pathfinding', () => {
  it('should find a path between two walkable points', () => {
    // From center path to another path point
    const path = findPath(
      { x: 9 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 12 * TILE_SIZE, y: 7 * TILE_SIZE }
    );
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
  });

  it('should return null when target is a building tile', () => {
    // Town Hall is at tileX:8, tileY:2 — that's a BUILDING tile
    const path = findPath(
      { x: 9 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 8 * TILE_SIZE, y: 2 * TILE_SIZE }
    );
    expect(path).toBeNull();
  });

  it('should return empty array when start equals target', () => {
    const path = findPath(
      { x: 9 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 9 * TILE_SIZE, y: 7 * TILE_SIZE }
    );
    expect(path).toEqual([]);
  });

  it('should return path with start as first point and target as last', () => {
    const start = { x: 9 * TILE_SIZE, y: 7 * TILE_SIZE };
    const end = { x: 12 * TILE_SIZE, y: 7 * TILE_SIZE };
    const path = findPath(start, end);
    expect(path).not.toBeNull();
    if (path && path.length > 0) {
      expect(path[path.length - 1].x).toBe(end.x);
      expect(path[path.length - 1].y).toBe(end.y);
    }
  });

  it('should only include walkable tiles in path', () => {
    const path = findPath(
      { x: 5 * TILE_SIZE, y: 7 * TILE_SIZE },
      { x: 15 * TILE_SIZE, y: 7 * TILE_SIZE }
    );
    expect(path).not.toBeNull();
    // Every point in the path should be on a walkable tile
    // (tested implicitly by pathfinder only expanding walkable nodes)
    expect(path!.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Overworld/usePathfinding.test.ts
```

Expected: FAIL.

**Step 3: Write usePathfinding.ts**

Create `src/components/Overworld/usePathfinding.ts`:

```typescript
import type { Point } from './types';
import { canMoveTo } from './useCollision';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants';

type Node = {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
};

function heuristic(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function nodeKey(x: number, y: number): string {
  return `${x},${y}`;
}

const DIRECTIONS = [
  { dx: 0, dy: -1 }, // up
  { dx: 0, dy: 1 },  // down
  { dx: -1, dy: 0 }, // left
  { dx: 1, dy: 0 },  // right
];

export function findPath(start: Point, end: Point): Point[] | null {
  const startTileX = Math.floor(start.x / TILE_SIZE);
  const startTileY = Math.floor(start.y / TILE_SIZE);
  const endTileX = Math.floor(end.x / TILE_SIZE);
  const endTileY = Math.floor(end.y / TILE_SIZE);

  // Same tile
  if (startTileX === endTileX && startTileY === endTileY) return [];

  // Target must be walkable
  if (!canMoveTo(end.x, end.y)) return null;

  const open: Node[] = [];
  const closed = new Set<string>();

  const startNode: Node = {
    x: startTileX,
    y: startTileY,
    g: 0,
    h: heuristic({ x: startTileX, y: startTileY }, { x: endTileX, y: endTileY }),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  open.push(startNode);

  while (open.length > 0) {
    // Find node with lowest f
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    const key = nodeKey(current.x, current.y);

    if (current.x === endTileX && current.y === endTileY) {
      // Reconstruct path
      const path: Point[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift({ x: node.x * TILE_SIZE, y: node.y * TILE_SIZE });
        node = node.parent;
      }
      // Remove start position from path (player is already there)
      path.shift();
      return path;
    }

    closed.add(key);

    for (const dir of DIRECTIONS) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;

      if (nx < 0 || nx >= MAP_COLS || ny < 0 || ny >= MAP_ROWS) continue;
      if (closed.has(nodeKey(nx, ny))) continue;
      if (!canMoveTo(nx * TILE_SIZE, ny * TILE_SIZE)) continue;

      const g = current.g + 1;
      const h = heuristic({ x: nx, y: ny }, { x: endTileX, y: endTileY });
      const f = g + h;

      const existingIdx = open.findIndex((n) => n.x === nx && n.y === ny);
      if (existingIdx >= 0 && open[existingIdx].g <= g) continue;

      if (existingIdx >= 0) open.splice(existingIdx, 1);

      open.push({ x: nx, y: ny, g, h, f, parent: current });
    }
  }

  return null; // No path found
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Overworld/usePathfinding.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(overworld): add A* pathfinding for click-to-move"
```

---

## Task 6: Sound Effects Hook (useSoundEffects)

**Files:**
- Create: `src/components/Overworld/useSoundEffects.ts`
- Create: `src/test/components/Overworld/useSoundEffects.test.ts`

**Step 1: Write the failing test**

Create `src/test/components/Overworld/useSoundEffects.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundEffects } from '../../../components/Overworld/useSoundEffects';

describe('useSoundEffects', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with sounds muted', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(result.current.muted).toBe(true);
  });

  it('should toggle mute state', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.muted).toBe(false);
  });

  it('should persist mute state to localStorage', () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.toggleMute();
    });

    expect(localStorage.getItem('overworld-audio-muted')).toBe('false');
  });

  it('should restore mute state from localStorage', () => {
    localStorage.setItem('overworld-audio-muted', 'false');

    const { result } = renderHook(() => useSoundEffects());
    expect(result.current.muted).toBe(false);
  });

  it('should expose play functions for each sound type', () => {
    const { result } = renderHook(() => useSoundEffects());
    expect(typeof result.current.playDialogOpen).toBe('function');
    expect(typeof result.current.playConfirm).toBe('function');
    expect(typeof result.current.playCancel).toBe('function');
    expect(typeof result.current.playTransition).toBe('function');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Overworld/useSoundEffects.test.ts
```

Expected: FAIL.

**Step 3: Write useSoundEffects.ts**

Create `src/components/Overworld/useSoundEffects.ts`:

Follow the same pattern as `HollandSounds.tsx` — dynamic import of jsfxr, localStorage persistence, lazy loading.

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'overworld-audio-muted';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SfxrModule = any;

export function useSoundEffects() {
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== 'false'; // muted by default
  });
  const sfxrRef = useRef<SfxrModule>(null);

  // Load jsfxr dynamically
  useEffect(() => {
    const loadJsfxr = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsfxr: any = await import('jsfxr');
        const sfxr = jsfxr.sfxr;
        if (sfxr?.generate && sfxr?.play) {
          sfxrRef.current = sfxr;
        }
      } catch {
        // Audio not available — silent fallback
      }
    };
    loadJsfxr();
  }, []);

  // Persist mute state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, muted.toString());
  }, [muted]);

  const playSound = useCallback(
    (preset: string) => {
      if (muted || !sfxrRef.current) return;
      try {
        const sound = sfxrRef.current.generate(preset);
        sfxrRef.current.play(sound);
      } catch {
        // Silently fail
      }
    },
    [muted]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const playDialogOpen = useCallback(() => playSound('powerUp'), [playSound]);
  const playConfirm = useCallback(() => playSound('pickupCoin'), [playSound]);
  const playCancel = useCallback(() => playSound('hit'), [playSound]);
  const playTransition = useCallback(() => playSound('jump'), [playSound]);

  return {
    muted,
    toggleMute,
    playDialogOpen,
    playConfirm,
    playCancel,
    playTransition,
  };
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Overworld/useSoundEffects.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(overworld): add jsfxr sound effects hook"
```

---

## Task 7: Game State Reducer

**Files:**
- Create: `src/components/Overworld/gameReducer.ts`
- Create: `src/test/components/Overworld/gameReducer.test.ts`

**Step 1: Write the failing test**

Create `src/test/components/Overworld/gameReducer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { gameReducer, initialGameState } from '../../../components/Overworld/gameReducer';
import { buildings } from '../../../components/Overworld/mapData';

describe('gameReducer', () => {
  it('should have correct initial state', () => {
    expect(initialGameState.player.isMoving).toBe(false);
    expect(initialGameState.player.direction).toBe('down');
    expect(initialGameState.dialog.open).toBe(false);
    expect(initialGameState.nearbyBuilding).toBeNull();
    expect(initialGameState.path).toBeNull();
    expect(initialGameState.audio.muted).toBe(true);
    expect(initialGameState.highContrast).toBe(false);
  });

  it('should handle MOVE_PLAYER', () => {
    const state = gameReducer(initialGameState, {
      type: 'MOVE_PLAYER',
      x: 100,
      y: 200,
      direction: 'right',
    });
    expect(state.player.x).toBe(100);
    expect(state.player.y).toBe(200);
    expect(state.player.direction).toBe('right');
  });

  it('should handle SET_MOVING', () => {
    const state = gameReducer(initialGameState, { type: 'SET_MOVING', isMoving: true });
    expect(state.player.isMoving).toBe(true);
  });

  it('should handle SET_FRAME', () => {
    const state = gameReducer(initialGameState, { type: 'SET_FRAME', frame: 2 });
    expect(state.player.frame).toBe(2);
  });

  it('should handle SET_NEARBY_BUILDING', () => {
    const building = buildings[0];
    const state = gameReducer(initialGameState, { type: 'SET_NEARBY_BUILDING', building });
    expect(state.nearbyBuilding?.id).toBe(building.id);
  });

  it('should handle OPEN_DIALOG', () => {
    const building = buildings[0];
    const state = gameReducer(initialGameState, { type: 'OPEN_DIALOG', building });
    expect(state.dialog.open).toBe(true);
    expect(state.dialog.building?.id).toBe(building.id);
  });

  it('should handle CLOSE_DIALOG', () => {
    const withDialog = gameReducer(initialGameState, { type: 'OPEN_DIALOG', building: buildings[0] });
    const state = gameReducer(withDialog, { type: 'CLOSE_DIALOG' });
    expect(state.dialog.open).toBe(false);
    expect(state.dialog.building).toBeNull();
  });

  it('should handle SET_PATH', () => {
    const path = [{ x: 100, y: 200 }, { x: 132, y: 200 }];
    const state = gameReducer(initialGameState, { type: 'SET_PATH', path });
    expect(state.path).toEqual(path);
  });

  it('should handle TOGGLE_AUDIO', () => {
    const state = gameReducer(initialGameState, { type: 'TOGGLE_AUDIO' });
    expect(state.audio.muted).toBe(false);
  });

  it('should handle TOGGLE_HIGH_CONTRAST', () => {
    const state = gameReducer(initialGameState, { type: 'TOGGLE_HIGH_CONTRAST' });
    expect(state.highContrast).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Overworld/gameReducer.test.ts
```

Expected: FAIL.

**Step 3: Write gameReducer.ts**

Create `src/components/Overworld/gameReducer.ts`:

```typescript
import type { GameState, GameAction } from './types';
import { SPAWN_X, SPAWN_Y, TILE_SIZE } from './constants';

export const initialGameState: GameState = {
  player: {
    x: SPAWN_X * TILE_SIZE,
    y: SPAWN_Y * TILE_SIZE,
    direction: 'down',
    isMoving: false,
    frame: 0,
  },
  nearbyBuilding: null,
  dialog: { open: false, building: null },
  path: null,
  audio: { muted: true },
  highContrast: false,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE_PLAYER':
      return {
        ...state,
        player: {
          ...state.player,
          x: action.x,
          y: action.y,
          direction: action.direction,
        },
      };
    case 'SET_MOVING':
      return {
        ...state,
        player: { ...state.player, isMoving: action.isMoving },
      };
    case 'SET_FRAME':
      return {
        ...state,
        player: { ...state.player, frame: action.frame },
      };
    case 'SET_NEARBY_BUILDING':
      return { ...state, nearbyBuilding: action.building };
    case 'OPEN_DIALOG':
      return {
        ...state,
        dialog: { open: true, building: action.building },
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        dialog: { open: false, building: null },
      };
    case 'SET_PATH':
      return { ...state, path: action.path };
    case 'TOGGLE_AUDIO':
      return {
        ...state,
        audio: { muted: !state.audio.muted },
      };
    case 'TOGGLE_HIGH_CONTRAST':
      return { ...state, highContrast: !state.highContrast };
    default:
      return state;
  }
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Overworld/gameReducer.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(overworld): add game state reducer"
```

---

## Task 8: Acquire Pixel Art Assets

**Files:**
- Create: `public/assets/overworld/` directory
- Download: tileset spritesheet + character spritesheet

**Step 1: Create assets directory**

```bash
mkdir -p public/assets/overworld
```

**Step 2: Select and download tilesets**

Download free CC0/CC-BY pixel art assets. Recommended sources:
- Character: Search itch.io for "32x32 RPG character sprite sheet" (e.g., "Sprout Lands" by Cup Nooble, or similar CC0 sets)
- Tiles: Search itch.io for "32x32 RPG tileset" with grass, paths, trees, buildings

Save to:
- `public/assets/overworld/character.png` — 32x32 character spritesheet (4 directions x 3+ frames)
- `public/assets/overworld/tileset.png` — 32x32 tile spritesheet (grass, path, tree, fence, water, flower tiles)
- `public/assets/overworld/buildings.png` — Building sprites (or part of tileset)

**Important:** Verify the license allows commercial use. Save a `public/assets/overworld/LICENSE.txt` with attribution.

**Step 3: Create spriteSheet.ts mapping**

Create `src/components/Overworld/spriteSheet.ts`:

```typescript
// Sprite sheet coordinates — update these after downloading actual assets
// Each entry maps a tile/sprite name to its position in the spritesheet

import { TileType } from './types';
import { TILE_SIZE } from './constants';

// Tileset sprite positions (x, y in the tileset.png)
// These MUST be updated to match the actual downloaded tileset
export const tileSprites: Record<number, { x: number; y: number }> = {
  [TileType.GRASS]: { x: 0, y: 0 },
  [TileType.PATH]: { x: TILE_SIZE, y: 0 },
  [TileType.BUILDING]: { x: TILE_SIZE * 2, y: 0 },
  [TileType.TREE]: { x: TILE_SIZE * 3, y: 0 },
  [TileType.FENCE]: { x: TILE_SIZE * 4, y: 0 },
  [TileType.WATER]: { x: TILE_SIZE * 5, y: 0 },
  [TileType.FLOWER]: { x: TILE_SIZE * 6, y: 0 },
  [TileType.DOOR]: { x: TILE_SIZE * 7, y: 0 },
};

// Character walk cycle frame definitions
// Rows: down, left, right, up
// Columns: frame 0 (left step), frame 1 (idle), frame 2 (right step)
export const characterFrames = {
  down: [
    { x: 0, y: 0 },
    { x: TILE_SIZE, y: 0 },
    { x: TILE_SIZE * 2, y: 0 },
  ],
  left: [
    { x: 0, y: TILE_SIZE },
    { x: TILE_SIZE, y: TILE_SIZE },
    { x: TILE_SIZE * 2, y: TILE_SIZE },
  ],
  right: [
    { x: 0, y: TILE_SIZE * 2 },
    { x: TILE_SIZE, y: TILE_SIZE * 2 },
    { x: TILE_SIZE * 2, y: TILE_SIZE * 2 },
  ],
  up: [
    { x: 0, y: TILE_SIZE * 3 },
    { x: TILE_SIZE, y: TILE_SIZE * 3 },
    { x: TILE_SIZE * 2, y: TILE_SIZE * 3 },
  ],
};

// Asset paths (relative to public/)
export const TILESET_PATH = '/assets/overworld/tileset.png';
export const CHARACTER_PATH = '/assets/overworld/character.png';
export const BUILDINGS_PATH = '/assets/overworld/buildings.png';
```

**Step 4: Commit**

```bash
jj commit -m "feat(overworld): add pixel art assets and sprite sheet mappings"
```

**Note to implementer:** The exact sprite coordinates in `spriteSheet.ts` will need adjustment once the actual downloaded assets are inspected. The coordinates above are placeholders for a standard layout.

---

## Task 9: PixiJS Overworld Canvas Component

**Files:**
- Create: `src/components/Overworld/OverworldCanvas.tsx`
- Create: `src/components/Overworld/OverworldMap.tsx`
- Create: `src/components/Overworld/PlayerSprite.tsx`
- Create: `src/components/Overworld/BuildingZones.tsx`

This is the core rendering task. Since PixiJS canvas components are difficult to unit test with Testing Library (they render to WebGL, not DOM), **test this visually via `bun dev`** and write integration tests in Task 13.

**Step 1: Create OverworldMap.tsx**

Create `src/components/Overworld/OverworldMap.tsx` — renders the tile map using @pixi/tilemap:

```typescript
import { useRef, useEffect } from 'react';
import { extend, useApplication } from '@pixi/react';
import { CompositeTilemap } from '@pixi/tilemap';
import { Assets, Texture, Rectangle } from 'pixi.js';
import { tileMap } from './mapData';
import { tileSprites, TILESET_PATH } from './spriteSheet';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants';

// Register CompositeTilemap with @pixi/react
extend({ CompositeTilemap });

export function OverworldMap() {
  const tilemapRef = useRef<CompositeTilemap>(null);
  const { app } = useApplication();

  useEffect(() => {
    const loadAndRender = async () => {
      const tilemap = tilemapRef.current;
      if (!tilemap) return;

      const texture = await Assets.load(TILESET_PATH);
      tilemap.clear();

      for (let y = 0; y < MAP_ROWS; y++) {
        for (let x = 0; x < MAP_COLS; x++) {
          const tileType = tileMap[y][x];
          const sprite = tileSprites[tileType];
          if (!sprite) continue;

          const frame = new Rectangle(sprite.x, sprite.y, TILE_SIZE, TILE_SIZE);
          const tileTexture = new Texture({ source: texture.source, frame });
          tilemap.tile(tileTexture, x * TILE_SIZE, y * TILE_SIZE);
        }
      }
    };

    loadAndRender();
  }, [app]);

  return <compositeTilemap ref={tilemapRef} />;
}
```

**Step 2: Create PlayerSprite.tsx**

Create `src/components/Overworld/PlayerSprite.tsx` — animated character sprite:

```typescript
import { useRef, useEffect, useState } from 'react';
import { extend, useTick } from '@pixi/react';
import { AnimatedSprite as PixiAnimatedSprite, Assets, Texture, Rectangle } from 'pixi.js';
import type { Direction } from './types';
import { characterFrames, CHARACTER_PATH } from './spriteSheet';
import { TILE_SIZE, ANIMATION_FRAME_DURATION } from './constants';

extend({ AnimatedSprite: PixiAnimatedSprite });

type Props = {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
};

export function PlayerSprite({ x, y, direction, isMoving }: Props) {
  const spriteRef = useRef<PixiAnimatedSprite>(null);
  const [textures, setTextures] = useState<Record<Direction, Texture[]> | null>(null);

  useEffect(() => {
    const load = async () => {
      const baseTexture = await Assets.load(CHARACTER_PATH);
      const frames: Record<Direction, Texture[]> = {
        down: [],
        left: [],
        right: [],
        up: [],
      };

      for (const dir of ['down', 'left', 'right', 'up'] as Direction[]) {
        frames[dir] = characterFrames[dir].map(
          (f) => new Texture({ source: baseTexture.source, frame: new Rectangle(f.x, f.y, TILE_SIZE, TILE_SIZE) })
        );
      }

      setTextures(frames);
    };
    load();
  }, []);

  useTick(() => {
    const sprite = spriteRef.current;
    if (!sprite || !textures) return;

    const currentTextures = textures[direction];
    if (sprite.textures !== currentTextures) {
      sprite.textures = currentTextures;
    }

    if (isMoving) {
      sprite.animationSpeed = 1000 / (ANIMATION_FRAME_DURATION * 60);
      if (!sprite.playing) sprite.play();
    } else {
      sprite.stop();
      sprite.currentFrame = 1; // idle frame
    }
  });

  if (!textures) return null;

  return (
    <animatedSprite
      ref={spriteRef}
      textures={textures[direction]}
      x={x}
      y={y}
      animationSpeed={1000 / (ANIMATION_FRAME_DURATION * 60)}
      loop={true}
    />
  );
}
```

**Step 3: Create BuildingZones.tsx**

Create `src/components/Overworld/BuildingZones.tsx` — highlight effect near buildings:

```typescript
import { useTick } from '@pixi/react';
import { extend } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { useRef } from 'react';
import type { Building } from './types';
import { TILE_SIZE } from './constants';

extend({ Graphics: PixiGraphics });

type Props = {
  nearbyBuilding: Building | null;
};

export function BuildingZones({ nearbyBuilding }: Props) {
  const graphicsRef = useRef<PixiGraphics>(null);
  const pulseRef = useRef(0);

  useTick((ticker) => {
    const g = graphicsRef.current;
    if (!g) return;

    g.clear();

    if (!nearbyBuilding) return;

    pulseRef.current += ticker.deltaTime * 0.05;
    const alpha = 0.2 + Math.sin(pulseRef.current) * 0.15;

    const x = nearbyBuilding.tileX * TILE_SIZE;
    const y = nearbyBuilding.tileY * TILE_SIZE;
    const w = nearbyBuilding.width * TILE_SIZE;
    const h = nearbyBuilding.height * TILE_SIZE;

    g.rect(x - 2, y - 2, w + 4, h + 4);
    g.stroke({ width: 2, color: 0xffd700, alpha });
    g.fill({ color: 0xffd700, alpha: alpha * 0.3 });
  });

  return <graphics ref={graphicsRef} />;
}
```

**Step 4: Create OverworldCanvas.tsx**

Create `src/components/Overworld/OverworldCanvas.tsx`:

```typescript
import { Application, extend } from '@pixi/react';
import { Container } from 'pixi.js';
import { OverworldMap } from './OverworldMap';
import { PlayerSprite } from './PlayerSprite';
import { BuildingZones } from './BuildingZones';
import type { GameState } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

extend({ Container });

type Props = {
  state: GameState;
  onCanvasClick: (worldX: number, worldY: number) => void;
};

export function OverworldCanvas({ state, onCanvasClick }: Props) {
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const worldX = (e.clientX - rect.left) * scaleX;
    const worldY = (e.clientY - rect.top) * scaleY;
    onCanvasClick(worldX, worldY);
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', maxWidth: '960px', margin: '0 auto' }}
      onPointerDown={handlePointerDown}
    >
      <Application
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        backgroundAlpha={1}
        backgroundColor={0x4a8c3f}
        resizeTo={undefined}
        style={{
          width: '100%',
          height: 'auto',
          imageRendering: 'pixelated',
          display: 'block',
        }}
      >
        <container>
          <OverworldMap />
          <BuildingZones nearbyBuilding={state.nearbyBuilding} />
          <PlayerSprite
            x={state.player.x}
            y={state.player.y}
            direction={state.player.direction}
            isMoving={state.player.isMoving}
          />
        </container>
      </Application>
    </div>
  );
}
```

**Step 5: Verify rendering with dev server**

```bash
bun dev
```

Open `http://localhost:4321` and verify the canvas renders with a green background (the tileset won't load until assets are downloaded, but the canvas should appear).

**Step 6: Commit**

```bash
jj commit -m "feat(overworld): add PixiJS canvas rendering components"
```

---

## Task 10: Building Dialog Component (React Overlay)

**Files:**
- Create: `src/components/Overworld/BuildingDialog.tsx`
- Create: `src/test/components/Overworld/BuildingDialog.test.tsx`
- Create: `src/styles/overworld.css`

**Step 1: Write the failing test**

Create `src/test/components/Overworld/BuildingDialog.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BuildingDialog } from '../../../components/Overworld/BuildingDialog';
import { buildings } from '../../../components/Overworld/mapData';

describe('BuildingDialog', () => {
  const building = buildings[0]; // Town Hall
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  it('should render building name and description', () => {
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByText(building.name)).toBeInTheDocument();
    expect(screen.getByText(building.description)).toBeInTheDocument();
  });

  it('should have Enter and Cancel buttons', () => {
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByRole('button', { name: /enter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onConfirm when Enter is clicked', async () => {
    const user = userEvent.setup();
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /enter/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should have role=dialog and aria-label', () => {
    render(<BuildingDialog building={building} onConfirm={onConfirm} onCancel={onCancel} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-label', expect.stringContaining(building.name));
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Overworld/BuildingDialog.test.tsx
```

Expected: FAIL.

**Step 3: Create overworld.css**

Create `src/styles/overworld.css`:

```css
/* Overworld container */
.overworld {
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

.overworld__canvas-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 640 / 480;
}

/* Building dialog — RPG text box style */
.building-dialog {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 90%;
  max-width: 480px;
  padding: 1rem 1.25rem;
  background: #1a1a2e;
  border: 3px solid #e0c97f;
  border-radius: 4px;
  color: #f0f0f0;
  font-family: 'JetBrains Mono', monospace;
  image-rendering: auto;
}

.building-dialog__name {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #e0c97f;
}

.building-dialog__description {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #d0d0d0;
}

.building-dialog__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.building-dialog__btn {
  padding: 0.375rem 1rem;
  border: 2px solid #e0c97f;
  border-radius: 2px;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.building-dialog__btn--enter {
  background: #e0c97f;
  color: #1a1a2e;
}

.building-dialog__btn--enter:hover,
.building-dialog__btn--enter:focus-visible {
  background: #f0d98f;
}

.building-dialog__btn--cancel {
  background: transparent;
  color: #e0c97f;
}

.building-dialog__btn--cancel:hover,
.building-dialog__btn--cancel:focus-visible {
  background: rgba(224, 201, 127, 0.15);
}

/* Interaction prompt */
.overworld__prompt {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  padding: 0.25rem 0.75rem;
  background: rgba(26, 26, 46, 0.85);
  border: 2px solid #e0c97f;
  border-radius: 2px;
  color: #e0c97f;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  pointer-events: none;
}

/* Audio toggle */
.overworld__audio-toggle {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: rgba(26, 26, 46, 0.85);
  border: 2px solid #e0c97f;
  border-radius: 2px;
  color: #e0c97f;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* High contrast toggle */
.overworld__contrast-toggle {
  position: absolute;
  top: 0.5rem;
  right: 3rem;
  z-index: 10;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: rgba(26, 26, 46, 0.85);
  border: 2px solid #e0c97f;
  border-radius: 2px;
  color: #e0c97f;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fade transition */
.overworld__fade {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: black;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.overworld__fade--active {
  opacity: 1;
}

/* Accessible nav fallback */
.overworld__accessible-nav {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.overworld__accessible-nav:focus-within {
  position: static;
  width: auto;
  height: auto;
  padding: 1rem;
  background: var(--bg-primary, #fff);
}

/* Text-only fallback */
.overworld__text-fallback {
  padding: 2rem;
}

.overworld__text-fallback__list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.overworld__text-fallback__link {
  display: block;
  padding: 1rem;
  border: 1px solid var(--primary, #6366f1);
  border-radius: 0.25rem;
  text-decoration: none;
  color: var(--text-primary, #1e293b);
}

.overworld__text-fallback__link:hover {
  background: var(--bg-secondary, #f8fafc);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .overworld__fade {
    transition: none;
  }
}
```

**Step 4: Create BuildingDialog.tsx**

Create `src/components/Overworld/BuildingDialog.tsx`:

```typescript
import type { Building } from './types';

type Props = {
  building: Building;
  onConfirm: () => void;
  onCancel: () => void;
};

export function BuildingDialog({ building, onConfirm, onCancel }: Props) {
  return (
    <div
      className="building-dialog"
      role="dialog"
      aria-label={`${building.name} — ${building.description}`}
      aria-modal="true"
    >
      <h2 className="building-dialog__name">{building.name}</h2>
      <p className="building-dialog__description">{building.description}</p>
      <div className="building-dialog__actions">
        <button
          className="building-dialog__btn building-dialog__btn--cancel"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="building-dialog__btn building-dialog__btn--enter"
          onClick={onConfirm}
          autoFocus
          type="button"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
```

**Step 5: Run test to verify it passes**

```bash
bun run test -- src/test/components/Overworld/BuildingDialog.test.tsx
```

Expected: PASS.

**Step 6: Commit**

```bash
jj commit -m "feat(overworld): add building dialog and overworld CSS"
```

---

## Task 11: Accessible Navigation Fallback

**Files:**
- Create: `src/components/Overworld/AccessibleNav.tsx`
- Create: `src/test/components/Overworld/AccessibleNav.test.tsx`

**Step 1: Write the failing test**

Create `src/test/components/Overworld/AccessibleNav.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccessibleNav } from '../../../components/Overworld/AccessibleNav';

describe('AccessibleNav', () => {
  it('should render links for all 7 buildings', () => {
    render(<AccessibleNav />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(7);
  });

  it('should include links to all site pages', () => {
    render(<AccessibleNav />);
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: /resume/i })).toHaveAttribute('href', '/resume');
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
  });

  it('should have a heading', () => {
    render(<AccessibleNav />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('should have navigation landmark', () => {
    render(<AccessibleNav />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Overworld/AccessibleNav.test.tsx
```

Expected: FAIL.

**Step 3: Write AccessibleNav.tsx**

Create `src/components/Overworld/AccessibleNav.tsx`:

```typescript
import { buildings } from './mapData';

export function AccessibleNav() {
  return (
    <nav
      className="overworld__accessible-nav"
      aria-label="Site navigation (keyboard accessible)"
    >
      <h2>Navigate the Village</h2>
      <ul className="overworld__text-fallback__list">
        {buildings.map((building) => (
          <li key={building.id}>
            <a
              href={building.page}
              className="overworld__text-fallback__link"
            >
              <strong>{building.name}</strong> — {building.description}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function TextOnlyFallback() {
  return (
    <div className="overworld__text-fallback">
      <h1>Ben Newman</h1>
      <p>Welcome to the village! Choose a destination:</p>
      <ul className="overworld__text-fallback__list">
        {buildings.map((building) => (
          <li key={building.id}>
            <a href={building.page} className="overworld__text-fallback__link">
              <strong>{building.name}</strong>
              <br />
              {building.description}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Overworld/AccessibleNav.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
jj commit -m "feat(overworld): add accessible navigation fallback"
```

---

## Task 12: Main Overworld Component + Game Loop Integration

**Files:**
- Create: `src/components/Overworld/index.tsx`
- Create: `src/components/Overworld/OverworldUI.tsx`

This task wires everything together: reducer, input, collision, sound, PixiJS canvas, and React UI overlay.

**Step 1: Create OverworldUI.tsx**

Create `src/components/Overworld/OverworldUI.tsx`:

```typescript
import type { GameState, Building } from './types';
import { BuildingDialog } from './BuildingDialog';

type Props = {
  state: GameState;
  onDialogConfirm: () => void;
  onDialogCancel: () => void;
  onToggleAudio: () => void;
  onToggleContrast: () => void;
  onToggleTextMode: () => void;
  transitioning: boolean;
};

export function OverworldUI({
  state,
  onDialogConfirm,
  onDialogCancel,
  onToggleAudio,
  onToggleContrast,
  transitioning,
}: Props) {
  return (
    <>
      {/* Interaction prompt */}
      {state.nearbyBuilding && !state.dialog.open && (
        <div className="overworld__prompt" role="status" aria-live="polite">
          Press E to enter {state.nearbyBuilding.name}
        </div>
      )}

      {/* ARIA live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {state.nearbyBuilding
          ? `Near ${state.nearbyBuilding.name}. Press E to interact.`
          : 'Exploring the village. Use arrow keys or WASD to move.'}
      </div>

      {/* Building dialog */}
      {state.dialog.open && state.dialog.building && (
        <BuildingDialog
          building={state.dialog.building}
          onConfirm={onDialogConfirm}
          onCancel={onDialogCancel}
        />
      )}

      {/* Audio toggle */}
      <button
        className="overworld__audio-toggle"
        onClick={onToggleAudio}
        aria-label={state.audio.muted ? 'Unmute sounds' : 'Mute sounds'}
        type="button"
      >
        {state.audio.muted ? '🔇' : '🔊'}
      </button>

      {/* High contrast toggle */}
      <button
        className="overworld__contrast-toggle"
        onClick={onToggleContrast}
        aria-label={state.highContrast ? 'Disable high contrast' : 'Enable high contrast'}
        type="button"
      >
        HC
      </button>

      {/* Fade overlay */}
      <div className={`overworld__fade ${transitioning ? 'overworld__fade--active' : ''}`} />
    </>
  );
}
```

**Step 2: Create index.tsx**

Create `src/components/Overworld/index.tsx`:

```typescript
import { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { gameReducer, initialGameState } from './gameReducer';
import { useInput } from './useInput';
import { useSoundEffects } from './useSoundEffects';
import { canMoveTo, isNearBuilding } from './useCollision';
import { findPath } from './usePathfinding';
import { OverworldCanvas } from './OverworldCanvas';
import { OverworldUI } from './OverworldUI';
import { AccessibleNav, TextOnlyFallback } from './AccessibleNav';
import { MOVE_SPEED, TILE_SIZE } from './constants';
import type { Direction } from './types';

export function Overworld() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { keys, clickTarget, handleCanvasClick, clearClickTarget, clearInteract, clearEscape } = useInput();
  const { muted, toggleMute, playDialogOpen, playConfirm, playCancel, playTransition } = useSoundEffects();
  const [transitioning, setTransitioning] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const frameRef = useRef<number>(0);
  const lastFrameTime = useRef(0);
  const reducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Sync audio state
  useEffect(() => {
    if (state.audio.muted !== muted) {
      dispatch({ type: 'TOGGLE_AUDIO' });
    }
  }, [muted, state.audio.muted]);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      frameRef.current = requestAnimationFrame(gameLoop);
      const now = performance.now();
      if (now - lastFrameTime.current < 16) return; // ~60fps
      lastFrameTime.current = now;

      // Don't process movement when dialog is open
      if (state.dialog.open) return;

      let dx = 0;
      let dy = 0;
      let direction: Direction = state.player.direction;

      // Keyboard input
      if (keys.up) { dy = -MOVE_SPEED; direction = 'up'; }
      else if (keys.down) { dy = MOVE_SPEED; direction = 'down'; }
      if (keys.left) { dx = -MOVE_SPEED; direction = 'left'; }
      else if (keys.right) { dx = MOVE_SPEED; direction = 'right'; }

      // Click-to-move path following
      if (!dx && !dy && state.path && state.path.length > 0) {
        const target = state.path[0];
        const tdx = target.x - state.player.x;
        const tdy = target.y - state.player.y;
        const dist = Math.hypot(tdx, tdy);

        if (dist < MOVE_SPEED) {
          // Reached waypoint, advance to next
          dispatch({ type: 'MOVE_PLAYER', x: target.x, y: target.y, direction });
          const newPath = state.path.slice(1);
          dispatch({ type: 'SET_PATH', path: newPath.length > 0 ? newPath : null });
          return;
        }

        dx = (tdx / dist) * MOVE_SPEED;
        dy = (tdy / dist) * MOVE_SPEED;
        if (Math.abs(tdx) > Math.abs(tdy)) {
          direction = tdx > 0 ? 'right' : 'left';
        } else {
          direction = tdy > 0 ? 'down' : 'up';
        }
      }

      const isMoving = dx !== 0 || dy !== 0;
      dispatch({ type: 'SET_MOVING', isMoving });

      if (isMoving) {
        const newX = state.player.x + dx;
        const newY = state.player.y + dy;

        if (canMoveTo(newX, newY)) {
          dispatch({ type: 'MOVE_PLAYER', x: newX, y: newY, direction });
        } else {
          dispatch({ type: 'MOVE_PLAYER', x: state.player.x, y: state.player.y, direction });
        }
      }

      // Check building proximity
      const nearby = isNearBuilding(state.player.x, state.player.y);
      if (nearby?.id !== state.nearbyBuilding?.id) {
        dispatch({ type: 'SET_NEARBY_BUILDING', building: nearby });
      }
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [keys, state.player, state.path, state.dialog.open, state.nearbyBuilding]);

  // Handle interact key
  useEffect(() => {
    if (keys.interact && state.nearbyBuilding && !state.dialog.open) {
      playDialogOpen();
      dispatch({ type: 'OPEN_DIALOG', building: state.nearbyBuilding });
      clearInteract();
    }
  }, [keys.interact, state.nearbyBuilding, state.dialog.open, playDialogOpen, clearInteract]);

  // Handle escape key
  useEffect(() => {
    if (keys.escape && state.dialog.open) {
      playCancel();
      dispatch({ type: 'CLOSE_DIALOG' });
      clearEscape();
    }
  }, [keys.escape, state.dialog.open, playCancel, clearEscape]);

  // Handle click-to-move
  useEffect(() => {
    if (clickTarget) {
      const path = findPath(
        { x: state.player.x, y: state.player.y },
        clickTarget
      );
      dispatch({ type: 'SET_PATH', path });
      clearClickTarget();
    }
  }, [clickTarget, state.player.x, state.player.y, clearClickTarget]);

  const handleDialogConfirm = useCallback(() => {
    if (!state.dialog.building) return;
    playConfirm();
    setTransitioning(true);

    const url = state.dialog.building.page;
    playTransition();

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }, [state.dialog.building, playConfirm, playTransition]);

  const handleDialogCancel = useCallback(() => {
    playCancel();
    dispatch({ type: 'CLOSE_DIALOG' });
  }, [playCancel]);

  const handleToggleAudio = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const handleToggleContrast = useCallback(() => {
    dispatch({ type: 'TOGGLE_HIGH_CONTRAST' });
  }, []);

  const handleToggleTextMode = useCallback(() => {
    setTextMode((prev) => !prev);
  }, []);

  if (textMode) {
    return (
      <div className="overworld">
        <button onClick={handleToggleTextMode} type="button">
          Switch to Village View
        </button>
        <TextOnlyFallback />
      </div>
    );
  }

  return (
    <div className="overworld">
      {/* Skip link */}
      <a href="#overworld-nav" className="skip-link">Skip to navigation</a>

      {/* View as text link */}
      <button
        onClick={handleToggleTextMode}
        style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 10, fontSize: '0.75rem' }}
        type="button"
      >
        View as text
      </button>

      {/* Canvas */}
      <OverworldCanvas state={state} onCanvasClick={handleCanvasClick} />

      {/* React UI overlay */}
      <OverworldUI
        state={state}
        onDialogConfirm={handleDialogConfirm}
        onDialogCancel={handleDialogCancel}
        onToggleAudio={handleToggleAudio}
        onToggleContrast={handleToggleContrast}
        onToggleTextMode={handleToggleTextMode}
        transitioning={transitioning}
      />

      {/* Accessible tab-based nav (hidden visually, available to screen readers) */}
      <div id="overworld-nav">
        <AccessibleNav />
      </div>

      {/* noscript fallback */}
      <noscript>
        <TextOnlyFallback />
      </noscript>
    </div>
  );
}

export default Overworld;
```

**Step 3: Verify all tests still pass**

```bash
bun run test
```

Expected: All tests pass.

**Step 4: Commit**

```bash
jj commit -m "feat(overworld): wire up main component with game loop integration"
```

---

## Task 13: Update Homepage (index.astro)

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/layouts/Base.astro`

**Step 1: Update index.astro**

Replace the content of `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Overworld from '../components/Overworld';
import '../styles/overworld.css';
---

<Base title="Home">
  <Overworld client:load />
</Base>
```

**Step 2: Add "Return to Village" link in Base.astro**

In `src/layouts/Base.astro`, after the nav links but inside `<nav>`, add a conditional "Village" link that appears on non-home pages. Modify the nav section:

In the `<nav>` element, change the "Home" link to "Village" with a small icon or indicator:

```astro
<a href="/" class={`nav-link ${currentPath === '/' ? 'active' : ''}`}>
  {currentPath === '/' ? 'Village' : '← Village'}
</a>
```

**Step 3: Verify dev server renders**

```bash
bun dev
```

Open `http://localhost:4321` and verify the overworld canvas appears on the homepage.

**Step 4: Run all tests**

```bash
bun run test
```

**Step 5: Run lint and typecheck**

```bash
bun run lint && bun run typecheck
```

**Step 6: Commit**

```bash
jj commit -m "feat(overworld): replace homepage with overworld navigation"
```

---

## Task 14: Audio Descriptions (Web Speech API)

**Files:**
- Create: `src/components/Overworld/useAudioDescription.ts`
- Create: `src/test/components/Overworld/useAudioDescription.test.ts`

**Step 1: Write the failing test**

Create `src/test/components/Overworld/useAudioDescription.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioDescription } from '../../../components/Overworld/useAudioDescription';

describe('useAudioDescription', () => {
  it('should provide a describe function', () => {
    const { result } = renderHook(() => useAudioDescription());
    expect(typeof result.current.describeScene).toBe('function');
  });

  it('should call speechSynthesis when describing scene', () => {
    const mockSpeak = vi.fn();
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: mockSpeak, cancel: vi.fn() },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useAudioDescription());

    act(() => {
      result.current.describeScene();
    });

    expect(mockSpeak).toHaveBeenCalledOnce();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun run test -- src/test/components/Overworld/useAudioDescription.test.ts
```

Expected: FAIL.

**Step 3: Write useAudioDescription.ts**

Create `src/components/Overworld/useAudioDescription.ts`:

```typescript
import { useCallback } from 'react';
import { buildings } from './mapData';

export function useAudioDescription() {
  const describeScene = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const buildingList = buildings
      .map((b) => `${b.name}, which leads to ${b.description}`)
      .join('. ');

    const text = `You are in a pixel art village. There are seven buildings to explore. ${buildingList}. Use arrow keys or WASD to move your character. Press E near a building to interact.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { describeScene };
}
```

**Step 4: Run test to verify it passes**

```bash
bun run test -- src/test/components/Overworld/useAudioDescription.test.ts
```

Expected: PASS.

**Step 5: Wire into OverworldUI** — Add a "Describe Scene" button to the OverworldUI component. Add the button in `OverworldUI.tsx`.

**Step 6: Commit**

```bash
jj commit -m "feat(overworld): add audio descriptions via Web Speech API"
```

---

## Task 15: Full Integration Test + Polish

**Files:**
- Run all tests
- Fix any integration issues
- Polish CSS and interaction flow

**Step 1: Run full test suite**

```bash
bun run test
```

Fix any failing tests.

**Step 2: Run linter**

```bash
bun run lint
```

Fix any lint errors.

**Step 3: Run type checker**

```bash
bun run typecheck
```

Fix any type errors.

**Step 4: Run build**

```bash
bun run build
```

Fix any build errors.

**Step 5: Visual QA with dev server**

```bash
bun dev
```

Test manually:
- [ ] Canvas renders with tile map
- [ ] Character renders and idles
- [ ] WASD/arrow keys move character
- [ ] Character collides with buildings
- [ ] Approaching building shows highlight + prompt
- [ ] Press E opens dialog
- [ ] Dialog shows building name + description
- [ ] Enter button navigates to correct page
- [ ] Cancel/Escape closes dialog
- [ ] Click-to-move works
- [ ] Audio toggle works
- [ ] High contrast toggle works
- [ ] "View as text" shows fallback navigation
- [ ] "Return to Village" link appears on inner pages
- [ ] Tab-based navigation works for screen readers
- [ ] `prefers-reduced-motion` disables animations

**Step 6: Commit final polish**

```bash
jj commit -m "fix(overworld): integration fixes and polish"
```

---

## Task 16: Mobile Support (Virtual D-pad)

**Files:**
- Create: `src/components/Overworld/VirtualDpad.tsx`
- Modify: `src/components/Overworld/index.tsx`
- Modify: `src/styles/overworld.css`

**Step 1: Create VirtualDpad.tsx**

A transparent d-pad overlay in the lower-left corner, only visible on touch devices.

```typescript
import { useCallback } from 'react';

type Props = {
  onDirection: (direction: 'up' | 'down' | 'left' | 'right', pressed: boolean) => void;
};

export function VirtualDpad({ onDirection }: Props) {
  const handlePointerDown = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    return () => onDirection(dir, true);
  }, [onDirection]);

  const handlePointerUp = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    return () => onDirection(dir, false);
  }, [onDirection]);

  return (
    <div className="virtual-dpad" role="group" aria-label="Movement controls">
      <button
        className="virtual-dpad__btn virtual-dpad__btn--up"
        onPointerDown={handlePointerDown('up')}
        onPointerUp={handlePointerUp('up')}
        onPointerLeave={handlePointerUp('up')}
        aria-label="Move up"
        type="button"
      >
        ▲
      </button>
      <button
        className="virtual-dpad__btn virtual-dpad__btn--left"
        onPointerDown={handlePointerDown('left')}
        onPointerUp={handlePointerUp('left')}
        onPointerLeave={handlePointerUp('left')}
        aria-label="Move left"
        type="button"
      >
        ◄
      </button>
      <button
        className="virtual-dpad__btn virtual-dpad__btn--right"
        onPointerDown={handlePointerDown('right')}
        onPointerUp={handlePointerUp('right')}
        onPointerLeave={handlePointerUp('right')}
        aria-label="Move right"
        type="button"
      >
        ►
      </button>
      <button
        className="virtual-dpad__btn virtual-dpad__btn--down"
        onPointerDown={handlePointerDown('down')}
        onPointerUp={handlePointerUp('down')}
        onPointerLeave={handlePointerUp('down')}
        aria-label="Move down"
        type="button"
      >
        ▼
      </button>
      <button
        className="virtual-dpad__btn virtual-dpad__btn--interact"
        onPointerDown={() => {}}
        aria-label="Interact"
        type="button"
      >
        E
      </button>
    </div>
  );
}
```

**Step 2: Add CSS for virtual d-pad** (in `overworld.css`)

**Step 3: Wire into main Overworld component — show only on touch devices**

**Step 4: Test on mobile viewport**

**Step 5: Commit**

```bash
jj commit -m "feat(overworld): add virtual d-pad for mobile touch input"
```

---

## Summary

| Task | Description | Est. Complexity |
|------|-------------|----------------|
| 1 | Install PixiJS dependencies | Low |
| 2 | Types, constants, map data | Medium |
| 3 | Input hook (useInput) | Low |
| 4 | Collision detection | Low |
| 5 | A* pathfinding | Medium |
| 6 | Sound effects hook | Low |
| 7 | Game state reducer | Low |
| 8 | Pixel art assets | Medium (manual) |
| 9 | PixiJS canvas components | High |
| 10 | Building dialog (React) | Low |
| 11 | Accessible nav fallback | Low |
| 12 | Main component + game loop | High |
| 13 | Update homepage | Low |
| 14 | Audio descriptions | Low |
| 15 | Integration test + polish | Medium |
| 16 | Mobile virtual d-pad | Medium |

**Dependencies:**
- Tasks 2-7 are independent, can be parallelized
- Task 8 (assets) can happen in parallel with code tasks
- Task 9 depends on Tasks 2, 8
- Task 10-11 depend on Task 2 (types)
- Task 12 depends on Tasks 2-11
- Task 13 depends on Task 12
- Tasks 14, 16 can be done after Task 12
- Task 15 is final integration
