import { TileType } from './types';
import type { Building, TileTypeValue } from './types';
import { MAP_COLS, MAP_ROWS } from './constants';

// Tile indices that the player can walk on (terrain only)
export const WALKABLE_TILES: TileTypeValue[] = [TileType.GRASS, TileType.PATH];

// 7 buildings corresponding to site pages
// Buildings are sprite overlays — not part of the terrain tile grid
export const buildings: Building[] = [
  {
    id: 'town-hall',
    name: 'Town Hall',
    description: 'Learn about Ben — background, interests, and what drives him.',
    page: '/about',
    tileX: 6, tileY: 0,
    footprintW: 3, footprintH: 5,
    entranceX: 7, entranceY: 5,
    spriteAsset: 'buildings/monastery.png',
    spriteWidth: 192, spriteHeight: 320,
    spriteOffsetY: 0,
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Browse projects and open source contributions.',
    page: '/projects',
    tileX: 0, tileY: 2,
    footprintW: 3, footprintH: 4,
    entranceX: 1, entranceY: 6,
    spriteAsset: 'buildings/barracks.png',
    spriteWidth: 192, spriteHeight: 256,
    spriteOffsetY: 0,
  },
  {
    id: 'library',
    name: 'Library',
    description: 'Read blog posts about tech, law, and life.',
    page: '/blog',
    tileX: 11, tileY: 1,
    footprintW: 5, footprintH: 4,
    entranceX: 13, entranceY: 5,
    spriteAsset: 'buildings/yellow-castle.png',
    spriteWidth: 320, spriteHeight: 256,
    spriteOffsetY: 0,
  },
  {
    id: 'courthouse',
    name: 'Courthouse',
    description: 'View the full resume and work history.',
    page: '/resume',
    tileX: 11, tileY: 7,
    footprintW: 5, footprintH: 4,
    entranceX: 13, entranceY: 11,
    spriteAsset: 'buildings/castle.png',
    spriteWidth: 320, spriteHeight: 256,
    spriteOffsetY: 0,
  },
  {
    id: 'observatory',
    name: 'Observatory',
    description: 'Personal metrics dashboard — Carlos, Holland, sports.',
    page: '/dashboard',
    tileX: 0, tileY: 7,
    footprintW: 2, footprintH: 4,
    entranceX: 1, entranceY: 11,
    spriteAsset: 'buildings/tower.png',
    spriteWidth: 128, spriteHeight: 256,
    spriteOffsetY: 0,
  },
  {
    id: 'dog-house',
    name: 'Dog House',
    description: 'All about Carlos the dog.',
    page: '/carlos',
    tileX: 9, tileY: 8,
    footprintW: 2, footprintH: 3,
    entranceX: 10, entranceY: 11,
    spriteAsset: 'buildings/house3.png',
    spriteWidth: 128, spriteHeight: 192,
    spriteOffsetY: 0,
  },
  {
    id: 'fairy-treehouse',
    name: 'Treehouse',
    description: 'Holland\'s enchanted corner of the village.',
    page: '/holland',
    tileX: 3, tileY: 8,
    footprintW: 2, footprintH: 3,
    entranceX: 4, entranceY: 11,
    spriteAsset: 'buildings/fairy-treehouse.png',
    spriteWidth: 192, spriteHeight: 288,
    spriteOffsetY: 0,
  },
];

// Generate terrain tile map (grass + paths only)
// Buildings are rendered as sprites above this, with separate collision
function generateTileMap(): TileTypeValue[][] {
  const map: TileTypeValue[][] = Array.from({ length: MAP_ROWS }, () =>
    Array.from({ length: MAP_COLS }, () => TileType.GRASS)
  );

  // Carve horizontal path across middle (row 6)
  for (let x = 0; x < MAP_COLS; x++) {
    map[6][x] = TileType.PATH;
  }

  // Carve vertical path down center (col 7-8)
  for (let y = 0; y < MAP_ROWS; y++) {
    if (map[y][7] === TileType.GRASS) map[y][7] = TileType.PATH;
    if (map[y][8] === TileType.GRASS) map[y][8] = TileType.PATH;
  }

  // Carve connector paths to building entrances
  for (const building of buildings) {
    const ex = building.entranceX;
    const ey = building.entranceY;
    // Vertical connection to the main horizontal path (row 6)
    const targetRow = 6;
    const startRow = Math.min(ey, targetRow);
    const endRow = Math.max(ey, targetRow);
    for (let y = startRow; y <= endRow; y++) {
      if (map[y][ex] === TileType.GRASS) map[y][ex] = TileType.PATH;
    }
  }

  // Add decorative trees along edges
  const treePositions = [
    [0, 0], [0, 1], [15, 0], [15, 1],
    [0, 11], [15, 11],
    [5, 0], [10, 0],
  ];
  for (const [x, y] of treePositions) {
    if (map[y][x] === TileType.GRASS) map[y][x] = TileType.TREE;
  }

  // Add scattered flowers
  const flowerPositions = [
    [3, 5], [11, 5], [9, 10],
  ];
  for (const [x, y] of flowerPositions) {
    if (map[y][x] === TileType.GRASS) map[y][x] = TileType.FLOWER;
  }

  return map;
}

export const tileMap = generateTileMap();

// Separate collision grid — marks building footprints as non-walkable
// true = blocked, false = open (terrain walkability still applies)
function generateCollisionMap(): boolean[][] {
  const map: boolean[][] = Array.from({ length: MAP_ROWS }, () =>
    Array.from({ length: MAP_COLS }, () => false)
  );

  for (const building of buildings) {
    for (let dy = 0; dy < building.footprintH; dy++) {
      for (let dx = 0; dx < building.footprintW; dx++) {
        const x = building.tileX + dx;
        const y = building.tileY + dy;
        if (x < MAP_COLS && y < MAP_ROWS) {
          map[y][x] = true;
        }
      }
    }
  }

  // Ensure entrance tiles are NOT blocked
  for (const building of buildings) {
    if (building.entranceY < MAP_ROWS && building.entranceX < MAP_COLS) {
      map[building.entranceY][building.entranceX] = false;
    }
  }

  return map;
}

export const collisionMap = generateCollisionMap();
