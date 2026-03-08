import { useRef, useEffect, useCallback } from 'react';
import { useApplication, useTick } from '@pixi/react';
import {
  Graphics as PixiGraphics,
  ParticleContainer,
  Particle,
  Container,
} from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import {
  resolvePreset,
  randomizeParticleParams,
} from './weatherPresets';
import type { Season } from '../Atmosphere/types';
import type { WeatherPreset, WeatherOverrides } from './weatherPresets';

// --- Per-particle physics state (parallel array, not on Particle object) ---

type ParticleState = {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  baseAlpha: number;
  rotSpeed: number;
  phase: number;
};

// --- Texture generation ---

function generateShapeTexture(
  renderer: import('pixi.js').Renderer,
  shape: WeatherPreset['shape'],
  shapeSize: WeatherPreset['shapeSize'],
) {
  const g = new PixiGraphics();
  g.beginFill(0xffffff);
  switch (shape) {
    case 'rect':
      g.rect(0, 0, shapeSize.w, shapeSize.h);
      break;
    case 'circle':
      g.circle(shapeSize.w / 2, shapeSize.h / 2, shapeSize.w / 2);
      break;
    case 'ellipse':
      g.ellipse(shapeSize.w / 2, shapeSize.h / 2, shapeSize.w / 2, shapeSize.h / 2);
      break;
  }
  g.fill({ color: 0xffffff });
  const texture = renderer.generateTexture(g);
  g.destroy();
  return texture;
}

// --- Reduced motion check ---

function usePrefersReducedMotion(): boolean {
  const ref = useRef(false);
  if (typeof window !== 'undefined' && ref.current === false) {
    ref.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return ref.current;
}

// --- Spawn helpers ---

function spawnParticleAtTop(
  particle: Particle,
  preset: WeatherPreset,
): ParticleState {
  const params = randomizeParticleParams(preset);
  particle.x = Math.random() * (CANVAS_WIDTH + 40) - 20;
  particle.y = -Math.random() * 40;
  particle.scaleX = params.scale;
  particle.scaleY = params.scale;
  particle.tint = params.color;
  particle.alpha = params.alpha;
  particle.rotation = Math.random() * Math.PI * 2;
  particle.anchorX = 0.5;
  particle.anchorY = 0.5;
  return {
    vx: params.vx,
    vy: params.vy,
    life: params.maxLife,
    maxLife: params.maxLife,
    baseAlpha: params.alpha,
    rotSpeed: params.rotSpeed,
    phase: params.phase,
  };
}

function spawnFirefly(
  particle: Particle,
  preset: WeatherPreset,
): ParticleState {
  const params = randomizeParticleParams(preset);
  particle.x = Math.random() * CANVAS_WIDTH;
  particle.y = Math.random() * CANVAS_HEIGHT;
  particle.scaleX = params.scale;
  particle.scaleY = params.scale;
  particle.tint = params.color;
  particle.alpha = 0;
  particle.anchorX = 0.5;
  particle.anchorY = 0.5;
  return {
    vx: params.vx,
    vy: params.vy,
    life: params.maxLife,
    maxLife: params.maxLife,
    baseAlpha: params.alpha,
    rotSpeed: 0,
    phase: params.phase,
  };
}

// --- Build particle container ---

function buildParticleContainer(
  renderer: import('pixi.js').Renderer,
  season: Season,
  overrides: WeatherOverrides | undefined,
): { pc: ParticleContainer<Particle>; states: ParticleState[]; preset: WeatherPreset } {
  const resolved = resolvePreset(season, overrides);
  const texture = generateShapeTexture(renderer, resolved.shape, resolved.shapeSize);

  const hasRotation = resolved.rotation.min !== 0 || resolved.rotation.max !== 0;
  const pc = new ParticleContainer<Particle>({
    texture,
    dynamicProperties: {
      position: true,
      color: true,
      rotation: hasRotation,
    },
  });
  pc.zIndex = 90;

  const states: ParticleState[] = [];
  const isSummer = season === 'summer';
  const spawnFn = isSummer ? spawnFirefly : spawnParticleAtTop;

  for (let i = 0; i < resolved.count; i++) {
    const p = new Particle(texture);
    const state = spawnFn(p, resolved);
    pc.addParticle(p);
    states.push(state);
  }

  return { pc, states, preset: resolved };
}

// --- Component ---

type Props = {
  season: Season;
  overrides?: WeatherOverrides;
};

export function WeatherParticles({ season, overrides }: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { app } = useApplication();
  const containerRef = useRef<Container | null>(null);
  const pcRef = useRef<ParticleContainer<Particle> | null>(null);
  const statesRef = useRef<ParticleState[]>([]);
  const presetRef = useRef<WeatherPreset | null>(null);
  const seasonRef = useRef<Season>(season);
  const overridesRef = useRef<WeatherOverrides | undefined>(overrides);
  // Track which season + overrides the current PC was built for
  const builtSeasonRef = useRef<Season | null>(null);
  const builtOverridesRef = useRef<string>('');

  // Keep refs fresh
  useEffect(() => {
    overridesRef.current = overrides;
  }, [overrides]);

  useEffect(() => {
    seasonRef.current = season;
  }, [season]);

  // Tear down on unmount
  useEffect(() => {
    return () => {
      if (pcRef.current) {
        pcRef.current.destroy({ children: true });
        pcRef.current = null;
        statesRef.current = [];
        builtSeasonRef.current = null;
        builtOverridesRef.current = '';
      }
    };
  }, []);

  // Tick loop: lazily creates the PC when renderer is ready, rebuilds on season change
  useTick((ticker) => {
    if (prefersReducedMotion) return;

    const renderer = app?.renderer;
    if (!renderer) return;

    const currentSeason = seasonRef.current;
    const currentOverridesKey = JSON.stringify(overridesRef.current ?? {});

    // Build or rebuild if season or overrides changed
    if (builtSeasonRef.current !== currentSeason || builtOverridesRef.current !== currentOverridesKey) {
      // Tear down old
      if (pcRef.current) {
        const parent = containerRef.current;
        if (parent && pcRef.current.parent === parent) {
          parent.removeChild(pcRef.current);
        }
        pcRef.current.destroy({ children: true });
      }

      const { pc, states, preset } = buildParticleContainer(
        renderer,
        currentSeason,
        overridesRef.current,
      );
      pcRef.current = pc;
      statesRef.current = states;
      presetRef.current = preset;
      builtSeasonRef.current = currentSeason;
      builtOverridesRef.current = currentOverridesKey;

      const parent = containerRef.current;
      if (parent) {
        parent.addChild(pc);
      }
    }

    const pc = pcRef.current;
    const preset = presetRef.current;
    if (!pc || !preset) return;

    const dt = ticker.deltaTime;
    const particles = pc.particleChildren;
    const states = statesRef.current;
    const isSummer = currentSeason === 'summer';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const s = states[i];

      // Apply gravity
      s.vy += preset.gravity * dt;

      // Apply sway
      if (preset.sway > 0) {
        p.x += Math.sin(s.life * preset.swayFreq + s.phase) * preset.sway * 0.02 * dt;
      }

      // Apply movement
      p.x += s.vx * dt;
      p.y += s.vy * dt;

      // Apply rotation
      if (s.rotSpeed !== 0) {
        p.rotation += s.rotSpeed * dt;
      }

      // Decay life
      s.life -= dt;

      // Alpha handling
      if (isSummer) {
        // Firefly blink: pulse using sine wave
        const lifeRatio = s.life / s.maxLife;
        p.alpha = s.baseAlpha * Math.abs(Math.sin(lifeRatio * Math.PI * 3));
      } else if (preset.alphaFade) {
        p.alpha = s.baseAlpha * (s.life / s.maxLife);
      }

      // Reset dead or off-screen particles
      if (
        s.life <= 0 ||
        p.y > CANVAS_HEIGHT + 20 ||
        p.x < -40 ||
        p.x > CANVAS_WIDTH + 40 ||
        (isSummer && p.y < -20)
      ) {
        const newState = isSummer
          ? spawnFirefly(p, preset)
          : spawnParticleAtTop(p, preset);
        states[i] = newState;
      }
    }
  });

  // Capture the container ref
  const setRef = useCallback((node: Container | null) => {
    containerRef.current = node;
    // If PC was created before ref was set, attach it now
    if (node && pcRef.current && !node.children.includes(pcRef.current)) {
      node.addChild(pcRef.current);
    }
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return <container ref={setRef} />;
}
