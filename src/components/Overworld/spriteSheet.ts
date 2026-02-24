import { TileType } from './types';
import type { Direction } from './types';
import { TILE_SIZE } from './constants';

// --- Terrain tileset ---
// tilemap.png (576x384) — Tiny Swords grass auto-tile at 64x64
// Full grass tile is top-left; stone path tiles are in the right half
export const tileSprites: Record<number, { x: number; y: number }> = {
  [TileType.GRASS]:  { x: 0, y: 0 },
  [TileType.PATH]:   { x: TILE_SIZE * 5, y: 0 },
  [TileType.TREE]:   { x: 0, y: 0 },    // Trees are decoration sprites, not tileset cells
  [TileType.WATER]:  { x: 0, y: 0 },    // Placeholder — water uses separate asset
  [TileType.FLOWER]: { x: 0, y: 0 },    // Flowers are decoration sprites
};

// --- Character sprite layout (Mana Seed) ---
// character.png (512x512, 8x8 grid of 64x64 frames)
//
// Row 0: Down  — stand, push(2), pull(2), jump(3)
// Row 1: Up    — stand, push(2), pull(2), jump(3)
// Row 2: Left  — stand, push(2), pull(2), jump(3)
// Row 3: Right — stand, push(2), pull(2), jump(3)
// Row 4: Down  — walk(6), run_replace(2)
// Row 5: Up    — walk(6), run_replace(2)
// Row 6: Left  — walk(6), run_replace(2)
// Row 7: Right — walk(6), run_replace(2)

// Idle frames: Row 0-3, column 0
export const characterIdle: Record<Direction, { x: number; y: number }> = {
  down:  { x: 0, y: 0 },
  up:    { x: 0, y: TILE_SIZE },
  left:  { x: 0, y: TILE_SIZE * 2 },
  right: { x: 0, y: TILE_SIZE * 3 },
};

// Walk frames: Row 4-7, columns 0-5 (6 frames per direction)
export const characterWalk: Record<Direction, Array<{ x: number; y: number }>> = {
  down: Array.from({ length: 6 }, (_, i) => ({
    x: i * TILE_SIZE,
    y: TILE_SIZE * 4,
  })),
  up: Array.from({ length: 6 }, (_, i) => ({
    x: i * TILE_SIZE,
    y: TILE_SIZE * 5,
  })),
  left: Array.from({ length: 6 }, (_, i) => ({
    x: i * TILE_SIZE,
    y: TILE_SIZE * 6,
  })),
  right: Array.from({ length: 6 }, (_, i) => ({
    x: i * TILE_SIZE,
    y: TILE_SIZE * 7,
  })),
};

// --- Asset paths (relative to site root, served from public/) ---
export const TILESET_PATH = '/assets/overworld/terrain/tilemap.png';
export const CHARACTER_PATH = '/assets/overworld/units/character.png';

// Building sprites are referenced via building.spriteAsset in mapData.ts
// e.g. 'buildings/monastery.png' → '/assets/overworld/buildings/monastery.png'
export function buildingAssetUrl(spriteAsset: string): string {
  return `/assets/overworld/${spriteAsset}`;
}

// Decoration assets
export const DECORATIONS = {
  tree1: '/assets/overworld/decorations/tree1.png',
  tree2: '/assets/overworld/decorations/tree2.png',
  bush1: '/assets/overworld/decorations/bush1.png',
  bush2: '/assets/overworld/decorations/bush2.png',
  rock1: '/assets/overworld/decorations/rock1.png',
  rock2: '/assets/overworld/decorations/rock2.png',
} as const;
