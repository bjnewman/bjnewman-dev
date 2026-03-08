import { useCallback } from 'react';
import { extend } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

extend({ Graphics: PixiGraphics });

type Props = {
  dayProgress: number;
};

// Smooth color interpolation for day/night
const DAY_PHASES = [
  { at: 0.00, r: 0, g: 0, b: 0, a: 0 },         // dawn start
  { at: 0.05, r: 255, g: 180, b: 100, a: 0.08 },  // sunrise
  { at: 0.10, r: 0, g: 0, b: 0, a: 0 },           // morning
  { at: 0.45, r: 0, g: 0, b: 0, a: 0 },           // midday (clear)
  { at: 0.60, r: 255, g: 140, b: 50, a: 0.12 },    // golden hour
  { at: 0.70, r: 180, g: 80, b: 40, a: 0.2 },      // sunset
  { at: 0.78, r: 15, g: 15, b: 60, a: 0.35 },      // dusk
  { at: 0.85, r: 5, g: 5, b: 30, a: 0.4 },         // night
  { at: 0.92, r: 5, g: 5, b: 30, a: 0.4 },         // late night
  { at: 0.97, r: 80, g: 50, b: 100, a: 0.15 },     // pre-dawn
  { at: 1.00, r: 0, g: 0, b: 0, a: 0 },            // dawn (loops)
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getOverlayColor(progress: number) {
  let prev = DAY_PHASES[DAY_PHASES.length - 1];
  for (const phase of DAY_PHASES) {
    if (progress <= phase.at) {
      const range = phase.at - prev.at || 1;
      const t = (progress - prev.at) / range;
      return {
        r: Math.round(lerp(prev.r, phase.r, t)),
        g: Math.round(lerp(prev.g, phase.g, t)),
        b: Math.round(lerp(prev.b, phase.b, t)),
        a: lerp(prev.a, phase.a, t),
      };
    }
    prev = phase;
  }
  return { r: 0, g: 0, b: 0, a: 0 };
}

export function DayNightOverlay({ dayProgress }: Props) {
  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      const { r, g: green, b, a } = getOverlayColor(dayProgress);
      if (a > 0.001) {
        g.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        g.fill({ color: (r << 16) | (green << 8) | b, alpha: a });
      }
    },
    [dayProgress]
  );

  return <graphics draw={draw} zIndex={100} />;
}
