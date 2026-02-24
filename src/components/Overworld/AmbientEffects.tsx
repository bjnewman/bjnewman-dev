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
      // 8 frames, each 192x256
      const frames = Array.from({ length: 8 }, (_, i) =>
        new Texture({ source: base.source, frame: new Rectangle(i * 192, 0, 192, 256) })
      );
      setTextures(frames);
    };
    load();
  }, [variant]);

  if (!textures) return null;

  return (
    <animatedSprite
      ref={spriteRef}
      textures={textures}
      x={x}
      y={y}
      animationSpeed={1 / 20} // ~300ms per frame at 60fps
      loop={true}
      autoPlay={true}
    />
  );
}

// --- Drifting Clouds ---

function DriftingCloud({ src, startX, y, speed, scale }: {
  src: string; startX: number; y: number; speed: number; scale: number;
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
    // Wrap around when off-screen right
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
      alpha={0.6}
    />
  );
}

// --- Flickering Torch ---

function FlickeringTorch({ x, y }: { x: number; y: number }) {
  const spriteRef = useRef<PixiAnimatedSprite>(null);
  const [textures, setTextures] = useState<Texture[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const base = await Assets.load('/assets/overworld/particles/fire1.png');
      // fire1.png: 8 frames at 64x64, use first 4 (the actual flame frames)
      const frames = Array.from({ length: 4 }, (_, i) =>
        new Texture({ source: base.source, frame: new Rectangle(i * 64, 0, 64, 64) })
      );
      setTextures(frames);
    };
    load();
  }, []);

  if (!textures) return null;

  return (
    <animatedSprite
      ref={spriteRef}
      textures={textures}
      x={x}
      y={y}
      width={32}
      height={32}
      animationSpeed={1 / 12} // ~200ms per frame
      loop={true}
      autoPlay={true}
    />
  );
}

// --- Carlos (Sheep) near Dog House ---

function Carlos({ x, y }: { x: number; y: number }) {
  const spriteRef = useRef<PixiAnimatedSprite>(null);
  const [textures, setTextures] = useState<Texture[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const base = await Assets.load('/assets/overworld/decorations/sheep-idle.png');
      // 6 frames at 128x128
      const frames = Array.from({ length: 6 }, (_, i) =>
        new Texture({ source: base.source, frame: new Rectangle(i * 128, 0, 128, 128) })
      );
      setTextures(frames);
    };
    load();
  }, []);

  if (!textures) return null;

  return (
    <animatedSprite
      ref={spriteRef}
      textures={textures}
      x={x}
      y={y}
      width={64}
      height={64}
      animationSpeed={1 / 30} // slow idle
      loop={true}
      autoPlay={true}
    />
  );
}

// --- Main Ambient Effects Component ---

export function AmbientEffects() {
  // Find tree tile positions from the map
  const treePositions: Array<{ x: number; y: number; variant: 1 | 2 }> = [];
  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      if (tileMap[row][col] === TileType.TREE) {
        treePositions.push({
          x: col * TILE_SIZE - 64, // offset to center tree on tile
          y: row * TILE_SIZE - 192, // trees are tall, anchor at base
          variant: (col + row) % 2 === 0 ? 1 : 2,
        });
      }
    }
  }

  // Dog house entrance is at (10, 11) — place Carlos nearby
  const carlosX = 10 * TILE_SIZE + 32;
  const carlosY = 11 * TILE_SIZE - 16;

  // Building entrances for torches (offset slightly to the side)
  const torchPositions = [
    { x: 7 * TILE_SIZE - 20, y: 5 * TILE_SIZE - 10 },   // Town Hall
    { x: 1 * TILE_SIZE - 20, y: 6 * TILE_SIZE - 10 },   // Workshop
    { x: 13 * TILE_SIZE + 44, y: 5 * TILE_SIZE - 10 },  // Library
    { x: 13 * TILE_SIZE - 20, y: 11 * TILE_SIZE - 10 }, // Courthouse
    { x: 1 * TILE_SIZE + 44, y: 11 * TILE_SIZE - 10 },  // Observatory
  ];

  return (
    <>
      {/* Swaying trees */}
      {treePositions.map((t, i) => (
        <SwayingTree key={`tree-${i}`} x={t.x} y={t.y} variant={t.variant} />
      ))}

      {/* Drifting clouds (above buildings, z-ordered by render order) */}
      <DriftingCloud src="/assets/overworld/decorations/cloud1.png" startX={-200} y={10} speed={0.15} scale={0.3} />
      <DriftingCloud src="/assets/overworld/decorations/cloud2.png" startX={400} y={-20} speed={0.1} scale={0.25} />
      <DriftingCloud src="/assets/overworld/decorations/cloud3.png" startX={100} y={30} speed={0.2} scale={0.2} />

      {/* Flickering torches near entrances */}
      {torchPositions.map((t, i) => (
        <FlickeringTorch key={`torch-${i}`} x={t.x} y={t.y} />
      ))}

      {/* Carlos the sheep near the dog house */}
      <Carlos x={carlosX} y={carlosY} />
    </>
  );
}
