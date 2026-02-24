import { Application, extend } from '@pixi/react';
import { Container } from 'pixi.js';
import { OverworldMap } from './OverworldMap';
import { BuildingSprites } from './BuildingSprites';
import { PlayerSprite } from './PlayerSprite';
import { BuildingZones } from './BuildingZones';
import type { GameState } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

extend({ Container });

type Props = {
  state: GameState;
  onCanvasClick: (worldX: number, worldY: number) => void;
};

export function OverworldCanvas({ state, onCanvasClick }: Props) {
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const worldX = (e.clientX - rect.left) * scaleX;
    const worldY = (e.clientY - rect.top) * scaleY;
    onCanvasClick(worldX, worldY);
  };

  return (
    <div
      className="overworld__canvas-wrapper"
      onPointerDown={handlePointerDown}
    >
      <Application
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        backgroundAlpha={1}
        backgroundColor={0x4a8c3f}
        resizeTo={undefined}
        className="overworld__canvas"
      >
        <container>
          <OverworldMap />
          <BuildingSprites />
          <BuildingZones nearbyBuilding={state.nearbyBuilding} />
          <PlayerSprite
            x={state.player.x}
            y={state.player.y}
            direction={state.player.direction}
            isMoving={state.player.isMoving}
          />
        </container>
      </Application>
    </div>
  );
}
