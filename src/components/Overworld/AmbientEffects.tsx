import { useRef, useEffect, useState } from 'react';
import { extend, useTick } from '@pixi/react';
import {
  AnimatedSprite as PixiAnimatedSprite,
  Sprite as PixiSprite,
  Assets,
  Texture,
  Rectangle,
} from 'pixi.js';
import { TILE_SIZE, CANVAS_WIDTH } from './constants';
import { tileMap } from './mapData';
import { TileType } from './types';

extend({ AnimatedSprite: PixiAnimatedSprite, Sprite: PixiSprite });

// --- Swaying Trees ---

function SwayingTree({ x, y, variant }: { x: number; y: number; variant: 1 | 2 }) {
  const spriteRef = useRef<PixiAnimatedSprite>(null);
  const [textures, setTextures] = useState<Texture[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const path = `/assets/overworld/decorations/tree${variant}.png`;
      const base = await Assets.load(path);
      const frames = Array.from({ length: 8 }, (_, i) =>
        new Texture({ source: base.source, frame: new Rectangle(i * 192, 0, 192, 256) })
      );
      setTextures(frames);
    };
    load();
  }, [variant]);

  // Manually start animation once textures are loaded
  useEffect(() => {
    const sprite = spriteRef.current;
    if (sprite && textures) {
      sprite.textures = textures;
      sprite.animationSpeed = 1 / 20;
      sprite.play();
    }
  }, [textures]);

  if (!textures) return null;

  return (
    <animatedSprite
      ref={spriteRef}
      textures={textures}
      x={x}
      y={y}
      animationSpeed={1 / 20}
      loop={true}
    />
  );
}

// --- Drifting Clouds ---

function DriftingCloud({ src, startX, y, speed, scale, alpha = 0.6 }: {
  src: string; startX: number; y: number; speed: number; scale: number; alpha?: number;
}) {
  const spriteRef = useRef<PixiSprite>(null);
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    Assets.load(src).then(setTexture);
  }, [src]);

  useTick((ticker) => {
    const s = spriteRef.current;
    if (!s) return;
    s.x += speed * ticker.deltaTime;
    if (s.x > CANVAS_WIDTH + 100) {
      s.x = -600 * scale;
    }
  });

  if (!texture) return null;

  return (
    <sprite
      ref={spriteRef}
      texture={texture}
      x={startX}
      y={y}
      width={576 * scale}
      height={256 * scale}
      alpha={alpha}
    />
  );
}

// --- Main Ambient Effects Component ---

export function AmbientEffects() {
  const treePositions: Array<{ x: number; y: number; variant: 1 | 2 }> = [];
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      if (tileMap[row][col] === TileType.TREE) {
        treePositions.push({
          x: col * TILE_SIZE - 64,
          y: row * TILE_SIZE - 192,
          variant: (col + row) % 2 === 0 ? 1 : 2,
        });
      }
    }
  }

  const clouds = [
    { src: '/assets/overworld/decorations/cloud1.png', startX: -200, y: -10, speed: 0.12, scale: 0.35, alpha: 0.5 },
    { src: '/assets/overworld/decorations/cloud2.png', startX: 100,  y: 5,   speed: 0.08, scale: 0.4,  alpha: 0.55 },
    { src: '/assets/overworld/decorations/cloud3.png', startX: 400,  y: -25, speed: 0.15, scale: 0.2,  alpha: 0.45 },
    { src: '/assets/overworld/decorations/cloud1.png', startX: 700,  y: 15,  speed: 0.1,  scale: 0.25, alpha: 0.4 },
    { src: '/assets/overworld/decorations/cloud2.png', startX: -400, y: 35,  speed: 0.18, scale: 0.15, alpha: 0.35 },
    { src: '/assets/overworld/decorations/cloud3.png', startX: 250,  y: -5,  speed: 0.06, scale: 0.5,  alpha: 0.6 },
    { src: '/assets/overworld/decorations/cloud1.png', startX: 550,  y: 25,  speed: 0.14, scale: 0.22, alpha: 0.5 },
    { src: '/assets/overworld/decorations/cloud2.png', startX: -100, y: 40,  speed: 0.09, scale: 0.3,  alpha: 0.4 },
    { src: '/assets/overworld/decorations/cloud3.png', startX: 850,  y: 0,   speed: 0.11, scale: 0.28, alpha: 0.45 },
    { src: '/assets/overworld/decorations/cloud1.png', startX: 300,  y: 50,  speed: 0.07, scale: 0.18, alpha: 0.3 },
  ];

  return (
    <>
      {treePositions.map((t, i) => (
        <SwayingTree key={`tree-${i}`} x={t.x} y={t.y} variant={t.variant} />
      ))}

      {clouds.map((c, i) => (
        <DriftingCloud key={`cloud-${i}`} {...c} />
      ))}

      {/* Torches commented out — fire sprites are explosion bursts, need proper torch assets
      {torchPositions.map((t, i) => (
        <FlickeringTorch key={`torch-${i}`} x={t.x} y={t.y} />
      ))}
      */}
    </>
  );
}
