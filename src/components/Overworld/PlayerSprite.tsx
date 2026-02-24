import { useRef, useEffect, useState } from 'react';
import { extend, useTick } from '@pixi/react';
import { AnimatedSprite as PixiAnimatedSprite, Assets, Texture, Rectangle } from 'pixi.js';
import type { Direction } from './types';
import { characterIdle, characterWalk, CHARACTER_PATH } from './spriteSheet';
import { TILE_SIZE, ANIMATION_FRAME_DURATION } from './constants';

extend({ AnimatedSprite: PixiAnimatedSprite });

type Props = {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
};

type FrameSet = {
  idle: Record<Direction, Texture>;
  walk: Record<Direction, Texture[]>;
};

export function PlayerSprite({ x, y, direction, isMoving }: Props) {
  const spriteRef = useRef<PixiAnimatedSprite>(null);
  const [frames, setFrames] = useState<FrameSet | null>(null);

  useEffect(() => {
    const load = async () => {
      const baseTexture = await Assets.load(CHARACTER_PATH);

      const idle: Record<Direction, Texture> = {} as Record<Direction, Texture>;
      for (const dir of ['down', 'up', 'left', 'right'] as Direction[]) {
        const pos = characterIdle[dir];
        idle[dir] = new Texture({
          source: baseTexture.source,
          frame: new Rectangle(pos.x, pos.y, TILE_SIZE, TILE_SIZE),
        });
      }

      const walk: Record<Direction, Texture[]> = {} as Record<Direction, Texture[]>;
      for (const dir of ['down', 'up', 'left', 'right'] as Direction[]) {
        walk[dir] = characterWalk[dir].map(
          (pos) => new Texture({
            source: baseTexture.source,
            frame: new Rectangle(pos.x, pos.y, TILE_SIZE, TILE_SIZE),
          })
        );
      }

      setFrames({ idle, walk });
    };
    load();
  }, []);

  useTick(() => {
    const sprite = spriteRef.current;
    if (!sprite || !frames) return;

    if (isMoving) {
      const walkTextures = frames.walk[direction];
      if (sprite.textures !== walkTextures) {
        sprite.textures = walkTextures;
      }
      sprite.animationSpeed = 1000 / (ANIMATION_FRAME_DURATION * 60);
      if (!sprite.playing) sprite.play();
    } else {
      sprite.stop();
      // Show idle frame for current direction
      const idleTexture = frames.idle[direction];
      sprite.textures = [idleTexture];
      sprite.currentFrame = 0;
    }
  });

  if (!frames) return null;

  return (
    <animatedSprite
      ref={spriteRef}
      textures={[frames.idle[direction]]}
      x={x}
      y={y}
      animationSpeed={1000 / (ANIMATION_FRAME_DURATION * 60)}
      loop={true}
    />
  );
}
