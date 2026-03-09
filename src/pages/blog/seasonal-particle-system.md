---
title: "Building a Seasonal Particle System with PixiJS"
date: "2026-03-09"
description: "How I built a weather particle system with rain, snow, fireflies, and falling leaves using PixiJS ParticleContainers, procedural textures, and sinusoidal sway."
layout: ../../layouts/BlogPost.astro
---

As you may have noticed, there have been some updates recently. I started redesigning the page away from something less cookie-cutter and more suited to my tastes. I find the aesthetics of the video games of my teenage years to be comforting and a fun way to interact with structured information, so we went with PixiJS and some pre-built assets.

From there I outlined some of the critical features: pathfinding, Carlos the companion, gently swaying trees and drifting clouds. Next we added a weather system to replace some of the variety that our previous theme system allowed.

Aside: one of my least favorite software patterns is failing to commit to a choice and giving the user too many options — and yet I find myself reaching for this same tool so often.

Most of this work was fairly standard, but the pathfinding was custom, and the particle system for the weather effects and their configurability was some new development that took advantage of PixiJS's v8 `ParticleContainer` and drew inspiration from libraries like [pixi-particles](https://www.npmjs.com/package/pixi-particles) and [@pixi/particle-emitter](https://www.npmjs.com/package/@pixi/particle-emitter). For more details, read on.

## The Shape of Weather

Each season gets a weather preset — a plain object describing particle behavior:

```typescript
type WeatherPreset = {
  count: number;
  shape: 'rect' | 'circle' | 'ellipse';
  shapeSize: { w: number; h: number };
  speed: { min: number; max: number };
  wind: { min: number; max: number };
  gravity: number;
  sway: number;
  swayFreq: number;
  colors: number[];
  alphaFade: boolean;
  lifetime: { min: number; max: number };
  rotation: { min: number; max: number };
};
```

This single interface produces four distinct effects. Rain uses tall thin rectangles falling fast with gravity. Fireflies are slow-drifting circles with no gravity at all. Leaves are ellipses with heavy sway. Snow is circles that fade as they fall.

| Season | Shape | Count | Speed | Gravity | Sway | Special |
|--------|-------|-------|-------|---------|------|---------|
| Spring | Rect | 100 | 7–12 | 0.03 | 0 | Diagonal streaks |
| Summer | Circle | 30 | -0.3–0.3 | 0 | 20 | Blinking alpha |
| Fall | Ellipse | 40 | 1–2.5 | 0.005 | 50 | Serpentine paths |
| Winter | Circle | 60 | 0.5–1.2 | 0 | 15 | Fade on descent |

## One White Texture

Rather than loading sprite sheets, the system generates a single white texture at runtime:

```typescript
function generateShapeTexture(renderer, shape, shapeSize) {
  const g = new Graphics();
  g.beginFill(0xffffff);
  if (shape === 'rect') g.rect(0, 0, shapeSize.w, shapeSize.h);
  else if (shape === 'circle') g.circle(shapeSize.w / 2, shapeSize.h / 2, shapeSize.w / 2);
  else g.ellipse(shapeSize.w / 2, shapeSize.h / 2, shapeSize.w / 2, shapeSize.h / 2);
  g.fill({ color: 0xffffff });
  const texture = renderer.generateTexture(g);
  g.destroy();
  return texture;
}
```

Each particle gets its color from PixiJS's built-in `tint` property. One texture, one draw call, many colors. PixiJS's `ParticleContainer` batches everything into a single GPU draw call, so even 100 rain particles cost almost nothing.

## Parallel Array Physics

The physics state lives in a separate array, not on PixiJS objects:

```typescript
type ParticleState = {
  vx: number;       // wind velocity
  vy: number;       // fall velocity
  life: number;     // countdown to death
  maxLife: number;   // for alpha calculations
  baseAlpha: number;
  rotSpeed: number;
  phase: number;     // random offset for sway
};
```

Each frame, the update loop walks both arrays in lockstep — read physics state, compute new position, write to the PixiJS particle. This keeps the simulation predictable and avoids mutating renderer internals.

## The Sway Algorithm

The most expressive part of the system is a single line:

```typescript
p.x += Math.sin(s.life * preset.swayFreq + s.phase) * preset.sway * 0.02 * dt;
```

`s.life` counts down each frame, so the sine input changes over time. `s.phase` is a random offset per particle (0–2&pi;), so particles don't oscillate in unison. `preset.sway` controls amplitude and `swayFreq` controls frequency.

Fall leaves have `sway: 50` and `swayFreq: 0.03` — wide, slow oscillations that create serpentine descent paths. Winter snow uses `sway: 15` and `swayFreq: 0.02` — a gentle wobble. Fireflies get `sway: 20` with `swayFreq: 0.015` — lazy, wandering drift.

No physics engine. No force accumulators. One sine function does all the work.

## Firefly Blinking

Fireflies needed to glow and dim. The solution is another sine wave, this time over the particle's remaining life ratio:

```typescript
const lifeRatio = s.life / s.maxLife;
p.alpha = s.baseAlpha * Math.abs(Math.sin(lifeRatio * Math.PI * 3));
```

This produces 1.5 complete blink cycles over the particle's lifetime. `Math.abs` ensures alpha never goes negative. The result looks organic — fireflies pulse in and out at slightly different rates because each has a different `maxLife`.

## Recycling, Not Destroying

When a particle dies (lifetime expired or drifted off-screen), it gets respawned rather than destroyed:

```typescript
if (s.life <= 0 || p.y > CANVAS_HEIGHT + 20 || p.x < -40 || p.x > CANVAS_WIDTH + 40) {
  spawnParticleAtTop(p, s, preset);
}
```

Fireflies are special — they respawn anywhere on the canvas, not just at the top. This avoids the overhead of creating and garbage-collecting particle objects every frame.

## Accessibility

The entire particle system respects `prefers-reduced-motion`:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) return null;
```

No particles, no animation, no performance cost. The weather is a visual enhancement, not a functional requirement.

## User Control

The settings panel exposes four multipliers: density, speed, wind, and particle size. Crank density to 400% for a blizzard. Reverse wind direction for leaves blowing the other way. These multiply against the preset defaults, so the character of each season is preserved even with extreme settings.

There's also a pause button. It doesn't work. Time waits for no mortal.

## What I Learned

Particle systems don't need particle engines. A typed preset object, parallel arrays, `Math.sin` for sway, and PixiJS's `ParticleContainer` for batched rendering — that's the whole stack. The presets do the heavy lifting. Changing a season means swapping one config object and rebuilding the container.

The hardest part wasn't the physics. It was tuning the numbers. How fast should snow fall? How wide should leaf sway be? How many fireflies before it looks like a bug swarm? The answer is always: less than you think, and slower than you expect.

*Built with [Claude Code](https://claude.ai/code). The particle physics and architecture are mine; Claude helped with implementation velocity.*
