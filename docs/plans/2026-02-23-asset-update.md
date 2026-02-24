# Asset Update: Tiny Swords + Mana Seed Character

> **For the implementing session:** The original plan assumed 32px tiles and generic tilesets. The actual assets are different. Read this before continuing tasks 4+.

## What Changed

### Tile size: 64px (not 32px)
The Tiny Swords terrain tilemap uses **64x64 px** tiles. `constants.ts` must be updated:

```typescript
export const TILE_SIZE = 64;
export const MAP_COLS = 16;       // wider map to fit buildings
export const MAP_ROWS = 12;       // 16:12 = 4:3 aspect ratio
export const CANVAS_WIDTH = MAP_COLS * TILE_SIZE;  // 1024
export const CANVAS_HEIGHT = MAP_ROWS * TILE_SIZE; // 768
export const MOVE_SPEED = 3;      // faster to match bigger tiles
export const ANIMATION_FRAME_DURATION = 135; // per Mana Seed guide
export const INTERACTION_RANGE = 1;
export const SPAWN_X = 8;         // center of 16-col map
export const SPAWN_Y = 8;         // lower-center
```

### Buildings are individual sprite PNGs (not tileset cells)
Buildings are NOT part of a tile grid. They are individual transparent PNGs placed as sprites on top of the terrain. Each has its own pixel dimensions:

| Our Building | Asset File | Pixels | Footprint (tiles) |
|-------------|-----------|--------|-------------------|
| Town Hall (→/about) | monastery.png | 192x320 | 3x5 |
| Workshop (→/projects) | barracks.png | 192x256 | 3x4 |
| Library (→/blog) | house1.png | 128x192 | 2x3 |
| Courthouse (→/resume) | castle.png | 320x256 | 5x4 |
| Observatory (→/dashboard) | tower.png | 128x256 | 2x4 |
| Dog House (→/carlos) | house3.png | 128x192 | 2x3 |
| Fairy Treehouse (→/holland) | archery.png | 192x256 | 3x4 |

### Building type needs sprite info
The `Building` type in `types.ts` needs these additions:

```typescript
export type Building = {
  id: string;
  name: string;
  description: string;
  page: string;
  // Position on tile grid (top-left corner of footprint)
  tileX: number;
  tileY: number;
  // Collision footprint in tiles
  footprintW: number;
  footprintH: number;
  // Entrance tile (absolute, must be walkable)
  entranceX: number;
  entranceY: number;
  // Sprite rendering
  spriteAsset: string;          // path relative to /assets/overworld/
  spriteWidth: number;          // px
  spriteHeight: number;         // px
  spriteOffsetY: number;        // px — buildings render taller than footprint
};
```

### Map generation changes
The `generateTileMap()` function should:
- Fill terrain with grass tiles (from `tilemap.png`)
- Carve paths (stone ground tiles)
- Mark building footprints as non-walkable in a separate collision grid
- Buildings render as sprites ABOVE the terrain, not as tile types

The `TileType.BUILDING` concept should be removed from the terrain grid. Instead, maintain a separate collision map that marks building footprint tiles as blocked.

### Character sprite layout (Mana Seed)
The composited character is at `units/character.png` (512x512, 8x8 grid of 64x64 frames):

```
Row 0: Down  — stand, push(2), pull(2), jump(3)
Row 1: Up    — stand, push(2), pull(2), jump(3)
Row 2: Left  — stand, push(2), pull(2), jump(3)
Row 3: Right — stand, push(2), pull(2), jump(3)
Row 4: Down  — walk(6), run_replace(2)
Row 5: Up    — walk(6), run_replace(2)
Row 6: Left  — walk(6), run_replace(2)
Row 7: Right — walk(6), run_replace(2)
```

For our purposes:
- **Idle:** Row 0-3, column 0 (one frame per direction)
- **Walk:** Row 4-7, columns 0-5 (six frames per direction)
- **Walk timing:** 135ms per frame
- **Direction mapping:** row % 4 → 0=down, 1=up, 2=left, 3=right

### Terrain tileset
`terrain/tilemap.png` (576x384) is an auto-tile grass tileset with edge pieces at 64x64. The grass tiles with clean edges are in the top-left quadrant. For MVP, use the full-grass tile (top-left 64x64 of the left half) and the stone ground from the right half for paths.

### Asset file inventory

```
public/assets/overworld/
├── buildings/
│   ├── archery.png        (fairy treehouse)
│   ├── barracks.png       (workshop)
│   ├── castle.png         (courthouse)
│   ├── house1.png         (library)
│   ├── house2.png         (spare)
│   ├── house3.png         (dog house)
│   ├── monastery.png      (town hall)
│   └── tower.png          (observatory)
├── terrain/
│   ├── tilemap.png        (grass auto-tiles)
│   ├── water-bg.png
│   ├── water-foam.png
│   └── shadow.png
├── decorations/
│   ├── tree1.png, tree2.png
│   ├── bush1.png, bush2.png
│   ├── rock1.png, rock2.png
│   ├── rubber-duck.png    (easter egg)
│   └── sheep-idle.png
├── units/
│   ├── character.png      (512x512, composited player)
│   ├── pawn-idle.png      (Tiny Swords pawn, unused for now)
│   └── pawn-run.png       (Tiny Swords pawn, unused for now)
├── ui/
│   ├── banner.png, ribbons.png
│   ├── button-blue.png, button-blue-pressed.png
│   ├── button-red.png, button-red-pressed.png
│   ├── paper.png, paper-special.png
│   └── wood-table.png
├── particles/
│   ├── dust1.png, dust2.png
└── LICENSE.txt
```
