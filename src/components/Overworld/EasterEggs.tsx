import { useRef, useEffect, useState } from 'react';
import { extend, useTick } from '@pixi/react';
import {
  Sprite as PixiSprite,
  Assets,
  Texture,
  Rectangle,
} from 'pixi.js';
import { TILE_SIZE } from './constants';

extend({ Sprite: PixiSprite });

// --- Rubber Duck ---

function RubberDuck({ x, y }: { x: number; y: number }) {
  const spriteRef = useRef<PixiSprite>(null);
  const [texture, setTexture] = useState<Texture | null>(null);
  const bobPhase = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    const load = async () => {
      const base = await Assets.load('/assets/overworld/decorations/rubber-duck.png');
      // First frame: 32x32
      setTexture(new Texture({ source: base.source, frame: new Rectangle(0, 0, 32, 32) }));
    };
    load();
  }, []);

  useTick((ticker) => {
    const s = spriteRef.current;
    if (!s) return;
    bobPhase.current += ticker.deltaTime * 0.04;
    s.y = y + Math.sin(bobPhase.current) * 3;
  });

  if (!texture) return null;

  return (
    <sprite
      ref={spriteRef}
      texture={texture}
      x={x}
      y={y}
      width={32}
      height={32}
      eventMode="static"
      cursor="pointer"
      onPointerDown={() => {
        // Quack via Web Audio API
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        } catch {
          // Audio not available
        }
      }}
    />
  );
}

// --- Konami Code Detector ---

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export function useKonamiCode(onActivate: () => void) {
  const indexRef = useRef(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === KONAMI_SEQUENCE[indexRef.current]) {
        indexRef.current++;
        if (indexRef.current === KONAMI_SEQUENCE.length) {
          indexRef.current = 0;
          onActivate();
        }
      } else {
        indexRef.current = 0;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onActivate]);
}

// --- Easter Eggs Component ---

export function EasterEggs() {
  // Place rubber duck in a quiet corner of the map
  const duckX = 5 * TILE_SIZE + 16;
  const duckY = 11 * TILE_SIZE + 16;

  return (
    <>
      <RubberDuck x={duckX} y={duckY} />
    </>
  );
}
