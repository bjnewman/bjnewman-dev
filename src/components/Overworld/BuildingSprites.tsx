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
      const loaded = new Map<string, Texture>();
      for (const building of buildings) {
        const url = buildingAssetUrl(building.spriteAsset);
        try {
          const texture = await Assets.load(url);
          loaded.set(building.id, texture);
        } catch {
          // Skip buildings whose assets fail to load
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
