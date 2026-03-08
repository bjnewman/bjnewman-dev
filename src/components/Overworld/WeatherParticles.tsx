import { useRef, useCallback, useEffect } from 'react';
import { extend, useTick } from '@pixi/react';
import { Graphics as PixiGraphics } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import type { Season } from '../Atmosphere/types';

extend({ Graphics: PixiGraphics });

// --- Particle types ---

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: number;
  /** Phase offset for sinusoidal sway (leaves) */
  phase: number;
};

type SeasonConfig = {
  count: number;
  spawn: () => Omit<Particle, 'life' | 'maxLife' | 'phase'> & { maxLife: number; phase?: number };
  update: (p: Particle, dt: number) => void;
  draw: (g: PixiGraphics, p: Particle) => void;
};

// --- Color palettes ---

const LEAF_COLORS = [0xd97706, 0xb91c1c, 0x92400e, 0xc2410c, 0xa16207];

// --- Season configs ---

function rainConfig(): SeasonConfig {
  return {
    count: 80,
    spawn: () => ({
      x: Math.random() * (CANVAS_WIDTH + 40) - 20,
      y: -Math.random() * 40,
      vx: 1 + Math.random(),
      vy: 8 + Math.random() * 4,
      size: 1 + Math.random(),
      alpha: 0.3 + Math.random() * 0.3,
      color: 0xb0c4de,
      maxLife: 80 + Math.random() * 40,
    }),
    update: (p, dt) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    },
    draw: (g, p) => {
      g.rect(p.x, p.y, p.size, 2);
      g.fill({ color: p.color, alpha: p.alpha });
    },
  };
}

function leavesConfig(): SeasonConfig {
  return {
    count: 30,
    spawn: () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: -Math.random() * 20,
      vx: 0,
      vy: 1 + Math.random() * 2,
      size: 3 + Math.random() * 2,
      alpha: 0.6 + Math.random() * 0.3,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      maxLife: 300 + Math.random() * 200,
      phase: Math.random() * Math.PI * 2,
    }),
    update: (p, dt) => {
      p.x += Math.sin(p.life * 0.03 + p.phase) * 0.8 * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    },
    draw: (g, p) => {
      g.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.6);
      g.fill({ color: p.color, alpha: p.alpha });
    },
  };
}

function snowConfig(): SeasonConfig {
  return {
    count: 50,
    spawn: () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: -Math.random() * 20,
      vx: (Math.random() - 0.5) * 0.6,
      vy: 0.5 + Math.random(),
      size: 2 + Math.random() * 2,
      alpha: 0.7 + Math.random() * 0.3,
      color: 0xffffff,
      maxLife: 500 + Math.random() * 300,
    }),
    update: (p, dt) => {
      p.x += (p.vx + Math.sin(p.life * 0.02) * 0.3) * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    },
    draw: (g, p) => {
      g.circle(p.x, p.y, p.size);
      g.fill({ color: p.color, alpha: p.alpha });
    },
  };
}

function getSeasonConfig(season: Season): SeasonConfig | null {
  switch (season) {
    case 'spring': return rainConfig();
    case 'fall': return leavesConfig();
    case 'winter': return snowConfig();
    case 'summer': return null;
  }
}

// --- Hooks ---

function usePrefersReducedMotion(): boolean {
  const ref = useRef(false);

  // Only check on mount — media query doesn't change often enough to warrant a listener
  // in this context (particles would restart anyway on re-mount)
  if (typeof window !== 'undefined' && ref.current === false) {
    ref.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  return ref.current;
}

// --- Component ---

type Props = {
  season: Season;
};

export function WeatherParticles({ season }: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const particlesRef = useRef<Particle[]>([]);
  const configRef = useRef<SeasonConfig | null>(null);

  // Reset particles when season changes
  useEffect(() => {
    const config = getSeasonConfig(season);
    configRef.current = config;
    particlesRef.current = [];
  }, [season]);

  useTick((ticker) => {
    const config = configRef.current;
    if (!config) return;

    const dt = ticker.deltaTime;
    const particles = particlesRef.current;

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      config.update(p, dt);

      // Remove dead particles (off-screen or expired)
      if (p.life <= 0 || p.y > CANVAS_HEIGHT + 20 || p.x < -40 || p.x > CANVAS_WIDTH + 40) {
        particles.splice(i, 1);
      }
    }

    // Spawn new particles to maintain pool
    while (particles.length < config.count) {
      const spawned = config.spawn();
      particles.push({
        ...spawned,
        life: spawned.maxLife,
        phase: spawned.phase ?? 0,
      });
    }
  });

  const draw = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      const config = configRef.current;
      if (!config) return;

      for (const p of particlesRef.current) {
        config.draw(g, p);
      }
    },
    // Season in deps so draw callback updates when config changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [season]
  );

  if (prefersReducedMotion || season === 'summer') {
    return null;
  }

  return <graphics draw={draw} zIndex={90} />;
}
