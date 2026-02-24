import type { SceneConfig } from './types';

// Interior tile paths (64x64, tileable)
const WALL = {
  stoneWarm: 'url(/assets/overworld/interior/wall-stone-warm.png)',
  stone: 'url(/assets/overworld/interior/wall-stone.png)',
  brick: 'url(/assets/overworld/interior/wall-brick.png)',
  magicWood: 'url(/assets/overworld/interior/wall-magic-wood.png)',
};

const FLOOR = {
  wood: 'url(/assets/overworld/interior/floor-wood.png)',
  woodDark: 'url(/assets/overworld/interior/floor-wood-dark.png)',
  stone: 'url(/assets/overworld/interior/floor-stone.png)',
  stoneDetail: 'url(/assets/overworld/interior/floor-stone-detail.png)',
};

// Warm tint overlays for interior atmosphere
const TINT = {
  warm: 'linear-gradient(rgba(40, 30, 20, 0.25), rgba(40, 30, 20, 0.4))',
  cool: 'linear-gradient(rgba(20, 25, 40, 0.2), rgba(20, 25, 40, 0.35))',
  magic: 'linear-gradient(rgba(60, 20, 80, 0.2), rgba(30, 10, 50, 0.35))',
};

// Composite tint + tile into a single background-image value
function tinted(tint: string, tile: string): string {
  return `${tint}, ${tile}`;
}

export const sceneConfigs: Record<string, SceneConfig> = {
  'town-hall': {
    wallTilePattern: tinted(TINT.warm, WALL.stoneWarm),
    floorTilePattern: FLOOR.wood,
    props: [
      { src: '/assets/overworld/ui/banner.png', x: '40%', y: '5%', width: '20%', height: 'auto' },
    ],
    characterX: '15%',
    characterY: '75%',
    characterDirection: 'down',
  },
  'workshop': {
    wallTilePattern: tinted(TINT.warm, WALL.brick),
    floorTilePattern: FLOOR.stone,
    props: [],
    characterX: '20%',
    characterY: '70%',
    characterDirection: 'right',
  },
  'library': {
    wallTilePattern: tinted(TINT.warm, WALL.stoneWarm),
    floorTilePattern: FLOOR.wood,
    props: [],
    characterX: '10%',
    characterY: '75%',
    characterDirection: 'right',
  },
  'courthouse': {
    wallTilePattern: tinted(TINT.cool, WALL.stone),
    floorTilePattern: FLOOR.stone,
    props: [
      { src: '/assets/overworld/ui/banner.png', x: '35%', y: '3%', width: '30%', height: 'auto' },
    ],
    characterX: '15%',
    characterY: '80%',
    characterDirection: 'up',
  },
  'observatory': {
    wallTilePattern: tinted(TINT.cool, WALL.stone),
    floorTilePattern: FLOOR.stoneDetail,
    props: [],
    characterX: '25%',
    characterY: '70%',
    characterDirection: 'left',
  },
  'dog-house': {
    wallTilePattern: tinted(TINT.warm, WALL.stoneWarm),
    floorTilePattern: FLOOR.wood,
    props: [],
    characterX: '20%',
    characterY: '75%',
    characterDirection: 'down',
  },
  'fairy-treehouse': {
    wallTilePattern: tinted(TINT.magic, WALL.magicWood),
    floorTilePattern: FLOOR.woodDark,
    props: [],
    characterX: '15%',
    characterY: '75%',
    characterDirection: 'right',
  },
};
