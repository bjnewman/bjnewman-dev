import { useEffect, useState } from 'react';
import { extend } from '@pixi/react';
import { Sprite as PixiSprite, Assets, Texture } from 'pixi.js';
import { buildings } from './mapData';
import { buildingAssetUrl } from './spriteSheet';
import { TILE_SIZE } from './constants';

extend({ Sprite: PixiSprite });

export function BuildingSprites() {
  const [textures, setTextures] = useState<Map<string, Texture>>(new Map());

  useEffect(() => {
    const load = async () => {
      const results = await Promise.allSettled(
        buildings.map(async (building) => {
          const url = buildingAssetUrl(building.spriteAsset);
          const texture = await Assets.load(url);
          return { id: building.id, texture } as { id: string; texture: Texture };
        })
      );

      const loaded = new Map<string, Texture>();
      for (const result of results) {
        if (result.status === 'fulfilled') {
          loaded.set(result.value.id, result.value.texture);
        }
      }
      setTextures(loaded);
    };
    load();
  }, []);

  return (
    <>
      {buildings.map((building) => {
        const texture = textures.get(building.id);
        if (!texture) return null;

        // Position sprite so footprint bottom aligns with tileY + footprintH
        const pixelX = building.tileX * TILE_SIZE;
        const footprintBottom = (building.tileY + building.footprintH) * TILE_SIZE;
        const pixelY = footprintBottom - building.spriteHeight - building.spriteOffsetY;

        return (
          <sprite
            key={building.id}
            texture={texture}
            x={pixelX}
            y={pixelY}
            width={building.spriteWidth}
            height={building.spriteHeight}
          />
        );
      })}
    </>
  );
}
