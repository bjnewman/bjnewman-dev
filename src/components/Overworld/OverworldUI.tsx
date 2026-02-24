import type { GameState } from './types';
import { BuildingDialog } from './BuildingDialog';
import { useAudioDescription } from './useAudioDescription';

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
      {/* Interaction prompt */}
      {state.nearbyBuilding && !state.dialog.open && (
        <div className="overworld__prompt" role="status" aria-live="polite">
          Press E to enter {state.nearbyBuilding.name}
        </div>
      )}

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
