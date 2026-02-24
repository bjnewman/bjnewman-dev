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
