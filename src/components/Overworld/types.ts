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
  // Position on tile grid (top-left corner of collision footprint)
  tileX: number;
  tileY: number;
  // Collision footprint in tiles
  footprintW: number;
  footprintH: number;
  // Entrance tile (absolute, must be walkable)
  entranceX: number;
  entranceY: number;
  // Sprite rendering
  spriteAsset: string;      // path relative to /assets/overworld/
  spriteWidth: number;      // px
  spriteHeight: number;     // px
  spriteOffsetY: number;    // px — buildings render taller than footprint
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
  | { type: 'SET_AUDIO_MUTED'; muted: boolean }
  | { type: 'TOGGLE_HIGH_CONTRAST' };

// Tile type constants for the terrain grid
// Buildings are NOT terrain — they're sprite overlays with a separate collision map
export const TileType = {
  GRASS: 0,
  PATH: 1,
  TREE: 2,
  WATER: 3,
  FLOWER: 4,
} as const;

export type TileTypeValue = (typeof TileType)[keyof typeof TileType];
