import { Application, extend } from '@pixi/react';
import { Container } from 'pixi.js';
import { OverworldMap } from './OverworldMap';
import { BuildingSprites } from './BuildingSprites';
import { PlayerSprite } from './PlayerSprite';
import { BuildingZones } from './BuildingZones';
import { AmbientEffects } from './AmbientEffects';
import { CarlosCompanion } from './CarlosCompanion';
import { EasterEggs } from './EasterEggs';
import { DayNightOverlay } from './DayNightOverlay';
import { WeatherParticles } from './WeatherParticles';
import { getBuildingAtPixel } from './useCollision';
import type { Building, GameState } from './types';
import type { Season } from '../Atmosphere/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

extend({ Container });

type Props = {
  state: GameState;
  onCanvasClick: (worldX: number, worldY: number) => void;
  onBuildingDoubleClick: (building: Building) => void;
  playSound: (name: string) => void;
  playerScale?: number;
  dayProgress: number;
  season: Season;
};

export function OverworldCanvas({ state, onCanvasClick, onBuildingDoubleClick, playSound, playerScale, dayProgress, season }: Props) {
  const toWorld = (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const { x, y } = toWorld(e);
    onCanvasClick(x, y);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = toWorld(e);
    const building = getBuildingAtPixel(x, y);
    if (building) {
      onBuildingDoubleClick(building);
    }
  };

  return (
    <div
      className="overworld__canvas-wrapper"
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
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
          <AmbientEffects />
          <BuildingSprites />
          <BuildingZones nearbyBuilding={state.nearbyBuilding} />
          <EasterEggs playSound={playSound} />
          <CarlosCompanion
            playerX={state.player.x}
            playerY={state.player.y}
            playerDirection={state.player.direction}
          />
          <PlayerSprite
            x={state.player.x}
            y={state.player.y}
            direction={state.player.direction}
            isMoving={state.player.isMoving}
            scale={playerScale}
          />
          <WeatherParticles season={season} />
          <DayNightOverlay dayProgress={dayProgress} />
        </container>
      </Application>
    </div>
  );
}
