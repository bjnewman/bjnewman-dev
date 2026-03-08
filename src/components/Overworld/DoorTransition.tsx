import { useRef, useCallback } from 'react';
import { useTick, extend } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

extend({ Graphics: PixiGraphics });

const DURATION_MS = 500;

type Props = {
  active: boolean;
  centerX: number;
  centerY: number;
  onComplete: () => void;
};

export function DoorTransition({ active, centerX, centerY, onComplete }: Props) {
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const graphicsRef = useRef<PixiGraphics | null>(null);

  // Max radius = distance from center to the furthest canvas corner
  const maxRadius = Math.hypot(
    Math.max(centerX, CANVAS_WIDTH - centerX),
    Math.max(centerY, CANVAS_HEIGHT - centerY),
  );

  useTick(() => {
    if (!active) return;

    const now = Date.now();
    if (startTimeRef.current === null) {
      startTimeRef.current = now;
      completedRef.current = false;
    }

    const elapsed = now - startTimeRef.current;
    const progress = Math.min(elapsed / DURATION_MS, 1);

    // Cubic ease-out: smooth deceleration
    const eased = 1 - Math.pow(1 - progress, 3);
    const radius = maxRadius * (1 - eased);

    const g = graphicsRef.current;
    if (g) {
      g.clear();
      g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      g.fill({ color: 0x000000 });
      g.circle(centerX, centerY, radius);
      g.cut();
    }

    if (progress >= 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  });

  const setRef = useCallback((g: PixiGraphics | null) => {
    graphicsRef.current = g;
  }, []);

  if (!active) {
    // Reset for next activation
    startTimeRef.current = null;
    completedRef.current = false;
    return null;
  }

  return <graphics ref={setRef} zIndex={200} />;
}
