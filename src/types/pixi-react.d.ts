// JSX type declarations for @pixi/react unprefixed elements + @pixi/tilemap
//
// @pixi/react's extend() registers both prefixed (pixiContainer) and unprefixed
// (container) elements at runtime, but only generates types for the prefixed
// variants. This file adds the unprefixed names we actually use in JSX.

import type {
  Container,
  Sprite,
  Graphics,
  AnimatedSprite,
} from 'pixi.js';
import type { CompositeTilemap } from '@pixi/tilemap';
import type { PixiReactElementProps } from '@pixi/react/types/typedefs/PixiReactNode';

declare module '@pixi/react/types/typedefs/PixiElements' {
  interface PixiElements {
    container: PixiReactElementProps<typeof Container>;
    sprite: PixiReactElementProps<typeof Sprite>;
    graphics: PixiReactElementProps<typeof Graphics>;
    animatedSprite: PixiReactElementProps<typeof AnimatedSprite>;
    compositeTilemap: PixiReactElementProps<typeof CompositeTilemap>;
  }
}
