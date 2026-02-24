import type { InteriorSceneProps } from './types';
import { sceneConfigs } from './sceneConfigs';
import { DoorButton } from './DoorButton';
import { InteractiveObject } from './InteractiveObject';

// Character sprite: idle frame from the Mana Seed spritesheet
// Row 0 col 0 = down, Row 1 col 0 = up, Row 2 col 0 = left, Row 3 col 0 = right
// Each frame is 64x64 in a 512x512 sheet
const DIRECTION_ROW: Record<string, number> = { down: 0, up: 1, left: 2, right: 3 };

function getCharacterStyle(direction: string): React.CSSProperties {
  const row = DIRECTION_ROW[direction] ?? 0;
  return {
    backgroundImage: 'url(/assets/overworld/units/character.png)',
    backgroundPosition: `0px -${row * 64}px`,
    backgroundSize: '512px 512px',
    imageRendering: 'pixelated',
  };
}

export function InteriorScene({
  buildingId,
  title,
  children,
  interactiveObjects = [],
}: InteriorSceneProps) {
  const config = sceneConfigs[buildingId];

  if (!config) {
    return <div className="interior-scene">{children}</div>;
  }

  return (
    <div className="interior-scene">
      {/* Tiled background */}
      <div
        className="interior-scene__background"
        style={{ backgroundImage: config.wallTilePattern }}
      />
      <div
        className="interior-scene__floor"
        style={{ backgroundImage: config.floorTilePattern }}
      />

      {/* Scene props */}
      {config.props.map((prop, i) => (
        <img
          key={i}
          src={prop.src}
          alt=""
          className="interior-scene__prop"
          style={{
            position: 'fixed',
            left: prop.x,
            top: prop.y,
            width: prop.width,
            height: prop.height,
            zIndex: prop.zIndex ?? 3,
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Character */}
      <div
        className="interior-scene__character"
        style={{
          left: config.characterX,
          top: config.characterY,
          ...getCharacterStyle(config.characterDirection),
        }}
        aria-hidden="true"
      />

      {/* Interactive objects */}
      {interactiveObjects.map((obj) => (
        <InteractiveObject key={obj.id} {...obj} />
      ))}

      {/* Content */}
      <div className="interior-scene__content">
        <div className="interior-scene__title">
          <span className="rpg-banner">{title}</span>
        </div>
        {children}
      </div>

      {/* Door button */}
      <DoorButton buildingId={buildingId} />
    </div>
  );
}

export default InteriorScene;
