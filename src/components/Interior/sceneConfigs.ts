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

export const sceneConfigs: Record<string, SceneConfig> = {
  'town-hall': {
    wallTilePattern: WALL.stoneWarm,
    floorTilePattern: FLOOR.wood,
    props: [
      { src: '/assets/overworld/ui/banner.png', x: '40%', y: '5%', width: '20%', height: 'auto' },
    ],
    characterX: '15%',
    characterY: '75%',
    characterDirection: 'right',
  },
  'workshop': {
    wallTilePattern: WALL.brick,
    floorTilePattern: FLOOR.stone,
    props: [],
    characterX: '20%',
    characterY: '70%',
    characterDirection: 'right',
  },
  'library': {
    wallTilePattern: WALL.stoneWarm,
    floorTilePattern: FLOOR.wood,
    props: [],
    characterX: '10%',
    characterY: '75%',
    characterDirection: 'right',
  },
  'courthouse': {
    wallTilePattern: WALL.stone,
    floorTilePattern: FLOOR.stone,
    props: [
      { src: '/assets/overworld/ui/banner.png', x: '35%', y: '3%', width: '30%', height: 'auto' },
    ],
    characterX: '15%',
    characterY: '80%',
    characterDirection: 'right',
  },
  'observatory': {
    wallTilePattern: WALL.stone,
    floorTilePattern: FLOOR.stoneDetail,
    props: [],
    characterX: '25%',
    characterY: '70%',
    characterDirection: 'right',
  },
  'dog-house': {
    wallTilePattern: WALL.stoneWarm,
    floorTilePattern: FLOOR.wood,
    props: [],
    characterX: '20%',
    characterY: '75%',
    characterDirection: 'down',
  },
  'fairy-treehouse': {
    wallTilePattern: WALL.magicWood,
    floorTilePattern: FLOOR.woodDark,
    props: [],
    characterX: '15%',
    characterY: '75%',
    characterDirection: 'right',
  },
};
