import { useRef, useEffect, useState } from 'react';
import { extend, useTick } from '@pixi/react';
import { AnimatedSprite as PixiAnimatedSprite, Assets, Texture, Rectangle } from 'pixi.js';
import type { Direction } from './types';
import { TILE_SIZE, SPAWN_X, SPAWN_Y } from './constants';

extend({ AnimatedSprite: PixiAnimatedSprite });

const CARLOS_SPEED = 2; // slightly slower than player (3)
const FOLLOW_DISTANCE = TILE_SIZE * 1.5; // start following when player is this far
const STOP_DISTANCE = TILE_SIZE * 0.7; // stop when this close
const HISTORY_LENGTH = 30; // frames of delay (~0.5s at 60fps)

// Carlos sprite layout: 256x256, 4x4 grid of 64x64 frames
// Row 0=down, Row 1=right, Row 2=left, Row 3=up, 4 frames each
type FrameSet = {
  idle: Record<Direction, Texture[]>;
  walk: Record<Direction, Texture[]>;
};

type Props = {
  playerX: number;
  playerY: number;
  playerDirection: Direction;
};

export function CarlosCompanion({ playerX, playerY, playerDirection }: Props) {
  const spriteRef = useRef<PixiAnimatedSprite>(null);
  const [frames, setFrames] = useState<FrameSet | null>(null);

  // Carlos's own position and state
  const posRef = useRef({ x: (SPAWN_X - 1) * TILE_SIZE, y: SPAWN_Y * TILE_SIZE });
  const dirRef = useRef<Direction>('down');
  const movingRef = useRef(false);

  // Player position history for delayed following
  const historyRef = useRef<Array<{ x: number; y: number }>>([]);

  // Load sprites
  useEffect(() => {
    const load = async () => {
      const [idleBase, walkBase] = await Promise.all([
        Assets.load('/assets/overworld/units/carlos-idle.png'),
        Assets.load('/assets/overworld/units/carlos-walk.png'),
      ]);

      const extractFrames = (base: Texture, row: number) =>
        Array.from({ length: 4 }, (_, col) =>
          new Texture({ source: base.source, frame: new Rectangle(col * 64, row * 64, 64, 64) })
        );

      const idle: Record<Direction, Texture[]> = {
        down: extractFrames(idleBase, 0),
        right: extractFrames(idleBase, 1),
        left: extractFrames(idleBase, 2),
        up: extractFrames(idleBase, 3),
      };

      const walk: Record<Direction, Texture[]> = {
        down: extractFrames(walkBase, 0),
        right: extractFrames(walkBase, 1),
        left: extractFrames(walkBase, 2),
        up: extractFrames(walkBase, 3),
      };

      setFrames({ idle, walk });
    };
    load();
  }, []);

  // Update position history with current player position
  useEffect(() => {
    historyRef.current.push({ x: playerX, y: playerY });
    if (historyRef.current.length > HISTORY_LENGTH) {
      historyRef.current.shift();
    }
  }, [playerX, playerY]);

  useTick(() => {
    const sprite = spriteRef.current;
    if (!sprite || !frames) return;

    const pos = posRef.current;

    // Follow the delayed player position (oldest entry in history)
    const target = historyRef.current.length > 0
      ? historyRef.current[0]
      : { x: playerX, y: playerY };

    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > FOLLOW_DISTANCE) {
      // Move toward target
      const nx = (dx / dist) * CARLOS_SPEED;
      const ny = (dy / dist) * CARLOS_SPEED;
      pos.x += nx;
      pos.y += ny;

      // Determine facing direction
      if (Math.abs(dx) > Math.abs(dy)) {
        dirRef.current = dx > 0 ? 'right' : 'left';
      } else {
        dirRef.current = dy > 0 ? 'down' : 'up';
      }
      movingRef.current = true;
    } else if (dist < STOP_DISTANCE) {
      movingRef.current = false;
      // Face same direction as player when idle
      dirRef.current = playerDirection;
    } else {
      movingRef.current = false;
    }

    // Update sprite
    sprite.x = pos.x;
    sprite.y = pos.y;

    const dir = dirRef.current;
    const targetTextures = movingRef.current ? frames.walk[dir] : frames.idle[dir];

    if (sprite.textures !== targetTextures) {
      sprite.textures = targetTextures;
      if (movingRef.current) {
        sprite.animationSpeed = 1 / 10;
        sprite.play();
      }
    }

    if (movingRef.current) {
      if (!sprite.playing) sprite.play();
    } else {
      sprite.animationSpeed = 1 / 25; // slow idle
      if (!sprite.playing) sprite.play();
    }
  });

  if (!frames) return null;

  return (
    <animatedSprite
      ref={spriteRef}
      textures={frames.idle.down}
      x={posRef.current.x}
      y={posRef.current.y}
      animationSpeed={1 / 25}
      loop={true}
    />
  );
}
