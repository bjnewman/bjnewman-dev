import { useTick } from '@pixi/react';
import { extend } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { useRef } from 'react';
import type { Building } from './types';
import { TILE_SIZE } from './constants';

extend({ Graphics: PixiGraphics });

type Props = {
  nearbyBuilding: Building | null;
};

export function BuildingZones({ nearbyBuilding }: Props) {
  const graphicsRef = useRef<PixiGraphics>(null);
  const pulseRef = useRef(0);

  useTick((ticker) => {
    const g = graphicsRef.current;
    if (!g) return;

    g.clear();

    if (!nearbyBuilding) return;

    pulseRef.current += ticker.deltaTime * 0.05;
    const alpha = 0.2 + Math.sin(pulseRef.current) * 0.15;

    const x = nearbyBuilding.tileX * TILE_SIZE;
    const y = nearbyBuilding.tileY * TILE_SIZE;
    const w = nearbyBuilding.footprintW * TILE_SIZE;
    const h = nearbyBuilding.footprintH * TILE_SIZE;

    g.rect(x - 2, y - 2, w + 4, h + 4);
    g.stroke({ width: 2, color: 0xffd700, alpha });
    g.fill({ color: 0xffd700, alpha: alpha * 0.3 });
  });

  return <graphics ref={graphicsRef} />;
}
