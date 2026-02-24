import { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { gameReducer, initialGameState } from './gameReducer';
import { useInput } from './useInput';
import { useSoundEffects } from './useSoundEffects';
import { canMoveTo, isNearBuilding } from './useCollision';
import { findPath } from './usePathfinding';
import { OverworldCanvas } from './OverworldCanvas';
import { OverworldUI } from './OverworldUI';
import { AccessibleNav, TextOnlyFallback } from './AccessibleNav';
import { MOVE_SPEED } from './constants';
import type { Direction } from './types';

export function Overworld() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { keys, clickTarget, handleCanvasClick, clearClickTarget, clearInteract, clearEscape } = useInput();
  const { muted, toggleMute, playDialogOpen, playConfirm, playCancel, playTransition } = useSoundEffects();
  const [transitioning, setTransitioning] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const frameRef = useRef<number>(0);
  const lastFrameTime = useRef(0);
  const reducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Sync audio state
  useEffect(() => {
    if (state.audio.muted !== muted) {
      dispatch({ type: 'TOGGLE_AUDIO' });
    }
  }, [muted, state.audio.muted]);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      frameRef.current = requestAnimationFrame(gameLoop);
      const now = performance.now();
      if (now - lastFrameTime.current < 16) return; // ~60fps
      lastFrameTime.current = now;

      // Don't process movement when dialog is open
      if (state.dialog.open) return;

      let dx = 0;
      let dy = 0;
      let direction: Direction = state.player.direction;

      // Keyboard input
      if (keys.up) { dy = -MOVE_SPEED; direction = 'up'; }
      else if (keys.down) { dy = MOVE_SPEED; direction = 'down'; }
      if (keys.left) { dx = -MOVE_SPEED; direction = 'left'; }
      else if (keys.right) { dx = MOVE_SPEED; direction = 'right'; }

      // Click-to-move path following
      if (!dx && !dy && state.path && state.path.length > 0) {
        const target = state.path[0];
        const tdx = target.x - state.player.x;
        const tdy = target.y - state.player.y;
        const dist = Math.hypot(tdx, tdy);

        if (dist < MOVE_SPEED) {
          // Reached waypoint, advance to next
          dispatch({ type: 'MOVE_PLAYER', x: target.x, y: target.y, direction });
          const newPath = state.path.slice(1);
          dispatch({ type: 'SET_PATH', path: newPath.length > 0 ? newPath : null });
          return;
        }

        dx = (tdx / dist) * MOVE_SPEED;
        dy = (tdy / dist) * MOVE_SPEED;
        if (Math.abs(tdx) > Math.abs(tdy)) {
          direction = tdx > 0 ? 'right' : 'left';
        } else {
          direction = tdy > 0 ? 'down' : 'up';
        }
      }

      const isMoving = dx !== 0 || dy !== 0;
      dispatch({ type: 'SET_MOVING', isMoving });

      if (isMoving) {
        const newX = state.player.x + dx;
        const newY = state.player.y + dy;

        if (canMoveTo(newX, newY)) {
          dispatch({ type: 'MOVE_PLAYER', x: newX, y: newY, direction });
        } else {
          dispatch({ type: 'MOVE_PLAYER', x: state.player.x, y: state.player.y, direction });
        }
      }

      // Check building proximity
      const nearby = isNearBuilding(state.player.x, state.player.y);
      if (nearby?.id !== state.nearbyBuilding?.id) {
        dispatch({ type: 'SET_NEARBY_BUILDING', building: nearby });
      }
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [keys, state.player, state.path, state.dialog.open, state.nearbyBuilding]);

  // Handle interact key
  useEffect(() => {
    if (keys.interact && state.nearbyBuilding && !state.dialog.open) {
      playDialogOpen();
      dispatch({ type: 'OPEN_DIALOG', building: state.nearbyBuilding });
      clearInteract();
    }
  }, [keys.interact, state.nearbyBuilding, state.dialog.open, playDialogOpen, clearInteract]);

  // Handle escape key
  useEffect(() => {
    if (keys.escape && state.dialog.open) {
      playCancel();
      dispatch({ type: 'CLOSE_DIALOG' });
      clearEscape();
    }
  }, [keys.escape, state.dialog.open, playCancel, clearEscape]);

  // Handle click-to-move
  useEffect(() => {
    if (clickTarget) {
      const path = findPath(
        { x: state.player.x, y: state.player.y },
        clickTarget
      );
      dispatch({ type: 'SET_PATH', path });
      clearClickTarget();
    }
  }, [clickTarget, state.player.x, state.player.y, clearClickTarget]);

  const handleDialogConfirm = useCallback(() => {
    if (!state.dialog.building) return;
    playConfirm();
    setTransitioning(true);

    const url = state.dialog.building.page;
    playTransition();

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }, [state.dialog.building, playConfirm, playTransition]);

  const handleDialogCancel = useCallback(() => {
    playCancel();
    dispatch({ type: 'CLOSE_DIALOG' });
  }, [playCancel]);

  const handleToggleAudio = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const handleToggleContrast = useCallback(() => {
    dispatch({ type: 'TOGGLE_HIGH_CONTRAST' });
  }, []);

  const handleToggleTextMode = useCallback(() => {
    setTextMode((prev) => !prev);
  }, []);

  if (textMode) {
    return (
      <div className="overworld">
        <button onClick={handleToggleTextMode} type="button">
          Switch to Village View
        </button>
        <TextOnlyFallback />
      </div>
    );
  }

  return (
    <div className="overworld">
      {/* Skip link */}
      <a href="#overworld-nav" className="skip-link">Skip to navigation</a>

      {/* View as text link */}
      <button
        className="overworld__text-toggle"
        onClick={handleToggleTextMode}
        type="button"
      >
        View as text
      </button>

      {/* Canvas */}
      <OverworldCanvas state={state} onCanvasClick={handleCanvasClick} />

      {/* React UI overlay */}
      <OverworldUI
        state={state}
        onDialogConfirm={handleDialogConfirm}
        onDialogCancel={handleDialogCancel}
        onToggleAudio={handleToggleAudio}
        onToggleContrast={handleToggleContrast}
        transitioning={transitioning}
      />

      {/* Accessible tab-based nav (hidden visually, available to screen readers) */}
      <div id="overworld-nav">
        <AccessibleNav />
      </div>

      {/* noscript fallback */}
      <noscript>
        <TextOnlyFallback />
      </noscript>
    </div>
  );
}

export default Overworld;
