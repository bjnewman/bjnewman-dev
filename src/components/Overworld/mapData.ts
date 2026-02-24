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
