import type { Season } from '../Atmosphere/types';

export type WeatherPreset = {
  count: number;
  speed: { min: number; max: number };
  wind: { min: number; max: number };
  size: { min: number; max: number };
  alpha: { min: number; max: number };
  alphaFade: boolean;
  lifetime: { min: number; max: number };
  colors: number[];
  rotation: { min: number; max: number };
  sway: number;
  swayFreq: number;
  gravity: number;
  shape: 'rect' | 'circle' | 'ellipse';
  shapeSize: { w: number; h: number };
};

export type WeatherOverrides = {
  count?: number;
  speed?: number;
  wind?: number;
  size?: number;
  opacity?: number;
};

const PRESETS: Record<Season, WeatherPreset> = {
  spring: {
    count: 100,
    speed: { min: 7, max: 12 },
    wind: { min: 1, max: 2 },
    size: { min: 0.8, max: 1.5 },
    alpha: { min: 0.45, max: 0.75 },
    alphaFade: false,
    lifetime: { min: 80, max: 120 },
    colors: [0xb0c4de, 0x8fa8c8, 0x9bb5d0],
    rotation: { min: 0, max: 0 },
    sway: 0,
    swayFreq: 0,
    gravity: 0.03,
    shape: 'rect',
    shapeSize: { w: 3, h: 16 },
  },
  summer: {
    count: 30,
    speed: { min: -0.3, max: 0.3 },
    wind: { min: -0.2, max: 0.2 },
    size: { min: 0.8, max: 1.5 },
    alpha: { min: 0.3, max: 0.9 },
    alphaFade: false,
    lifetime: { min: 120, max: 300 },
    colors: [0xd4e157, 0xcddc39, 0xffee58, 0xc6ff00],
    rotation: { min: 0, max: 0 },
    sway: 20,
    swayFreq: 0.015,
    gravity: 0,
    shape: 'circle',
    shapeSize: { w: 5, h: 5 },
  },
  fall: {
    count: 40,
    speed: { min: 1, max: 2.5 },
    wind: { min: 0.3, max: 1.0 },
    size: { min: 1.0, max: 2.0 },
    alpha: { min: 0.7, max: 0.95 },
    alphaFade: false,
    lifetime: { min: 300, max: 500 },
    colors: [0xd97706, 0xb91c1c, 0x92400e, 0xc2410c, 0xa16207],
    rotation: { min: -0.03, max: 0.03 },
    sway: 50,
    swayFreq: 0.03,
    gravity: 0.005,
    shape: 'ellipse',
    shapeSize: { w: 8, h: 5 },
  },
  winter: {
    count: 60,
    speed: { min: 0.5, max: 1.2 },
    wind: { min: -0.3, max: 0.3 },
    size: { min: 0.8, max: 1.8 },
    alpha: { min: 0.7, max: 1.0 },
    alphaFade: true,
    lifetime: { min: 400, max: 700 },
    colors: [0xffffff, 0xf0f8ff, 0xe8f0fe],
    rotation: { min: 0, max: 0 },
    sway: 15,
    swayFreq: 0.02,
    gravity: 0,
    shape: 'circle',
    shapeSize: { w: 5, h: 5 },
  },
};

export function getPreset(season: Season): WeatherPreset {
  return PRESETS[season];
}

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function resolvePreset(
  season: Season,
  overrides?: WeatherOverrides,
): WeatherPreset {
  const base = PRESETS[season];
  if (!overrides) return base;

  const countMult = overrides.count ?? 1;
  const speedMult = overrides.speed ?? 1;
  const windMult = overrides.wind ?? 1;
  const sizeMult = overrides.size ?? 1;
  const opacityMult = overrides.opacity ?? 1;

  return {
    ...base,
    count: Math.round(base.count * countMult),
    speed: {
      min: base.speed.min * speedMult,
      max: base.speed.max * speedMult,
    },
    wind: {
      min: base.wind.min * windMult,
      max: base.wind.max * windMult,
    },
    size: {
      min: base.size.min * sizeMult,
      max: base.size.max * sizeMult,
    },
    alpha: {
      min: Math.min(1, base.alpha.min * opacityMult),
      max: Math.min(1, base.alpha.max * opacityMult),
    },
  };
}

export function randomizeParticleParams(preset: WeatherPreset) {
  return {
    vx: randRange(preset.wind.min, preset.wind.max),
    vy: randRange(preset.speed.min, preset.speed.max),
    scale: randRange(preset.size.min, preset.size.max),
    alpha: randRange(preset.alpha.min, preset.alpha.max),
    maxLife: randRange(preset.lifetime.min, preset.lifetime.max),
    color: preset.colors[Math.floor(Math.random() * preset.colors.length)],
    rotSpeed: randRange(preset.rotation.min, preset.rotation.max),
    phase: Math.random() * Math.PI * 2,
  };
}
