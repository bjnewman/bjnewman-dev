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
