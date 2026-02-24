import type { GameState } from './types';
import { BuildingDialog } from './BuildingDialog';
import { useAudioDescription } from './useAudioDescription';
import { buildings } from './mapData';
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

type Props = {
  state: GameState;
  onDialogConfirm: () => void;
  onDialogCancel: () => void;
  onToggleAudio: () => void;
  onToggleContrast: () => void;
  transitioning: boolean;
};

export function OverworldUI({
  state,
  onDialogConfirm,
  onDialogCancel,
  onToggleAudio,
  onToggleContrast,
  transitioning,
}: Props) {
  const { describeScene } = useAudioDescription();

  return (
    <>
      {/* Building name signs — hide when interaction prompt is showing for that building */}
      {buildings.filter((b) => !(state.nearbyBuilding?.id === b.id && !state.dialog.open)).map((b) => {
        const centerX = (b.tileX + b.footprintW / 2) * TILE_SIZE;
        const leftPct = (centerX / CANVAS_WIDTH) * 100;
        const topPct = ((b.tileY * TILE_SIZE - TILE_SIZE * 0.25) / CANVAS_HEIGHT) * 100;
        return (
          <div
            key={b.id}
            className="overworld__building-sign"
            style={{ left: `${leftPct}%`, top: `${Math.max(0, topPct)}%` }}
          >
            {b.name}
          </div>
        );
      })}

      {/* Interaction prompt — positioned above the building entrance */}
      {state.nearbyBuilding && !state.dialog.open && (() => {
        const b = state.nearbyBuilding;
        const leftPct = ((b.entranceX * TILE_SIZE + TILE_SIZE / 2) / CANVAS_WIDTH) * 100;
        const topPct = ((b.tileY * TILE_SIZE - TILE_SIZE * 0.5) / CANVAS_HEIGHT) * 100;
        return (
          <div
            className="overworld__prompt"
            role="status"
            aria-live="polite"
            style={{ left: `${leftPct}%`, top: `${Math.max(0, topPct)}%` }}
          >
            Press E to enter {b.name}
          </div>
        );
      })()}

      {/* ARIA live region for screen readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {state.nearbyBuilding
          ? `Near ${state.nearbyBuilding.name}. Press E to interact.`
          : 'Exploring the village. Use arrow keys or WASD to move.'}
      </div>

      {/* Building dialog */}
      {state.dialog.open && state.dialog.building && (
        <BuildingDialog
          building={state.dialog.building}
          onConfirm={onDialogConfirm}
          onCancel={onDialogCancel}
        />
      )}

      {/* Audio toggle */}
      <button
        className="overworld__audio-toggle"
        onClick={onToggleAudio}
        aria-label={state.audio.muted ? 'Unmute sounds' : 'Mute sounds'}
        type="button"
      >
        {state.audio.muted ? '\u{1F507}' : '\u{1F50A}'}
      </button>

      {/* Describe scene (accessibility) */}
      <button
        className="overworld__describe-btn"
        onClick={describeScene}
        aria-label="Describe the village scene"
        type="button"
      >
        AD
      </button>

      {/* High contrast toggle */}
      <button
        className="overworld__contrast-toggle"
        onClick={onToggleContrast}
        aria-label={state.highContrast ? 'Disable high contrast' : 'Enable high contrast'}
        type="button"
      >
        HC
      </button>

      {/* Fade overlay */}
      <div className={`overworld__fade ${transitioning ? 'overworld__fade--active' : ''}`} />
    </>
  );
}
