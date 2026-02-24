import { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { gameReducer, initialGameState } from './gameReducer';
import { useInput } from './useInput';
import { useSoundEffects } from './useSoundEffects';
import { canMoveTo, isNearBuilding } from './useCollision';
import { findPath } from './usePathfinding';
import { OverworldCanvas } from './OverworldCanvas';
import { OverworldUI } from './OverworldUI';
import { VirtualDpad } from './VirtualDpad';
import { AccessibleNav, TextOnlyFallback } from './AccessibleNav';
import { MOVE_SPEED } from './constants';
import type { Direction } from './types';

export function Overworld() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { keys, clickTarget, handleCanvasClick, clearClickTarget, clearInteract, clearEscape, setDirectionKey } = useInput();
  const { muted, toggleMute, playDialogOpen, playConfirm, playCancel, playTransition } = useSoundEffects();
  const [transitioning, setTransitioning] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const frameRef = useRef<number>(0);
  const lastFrameTime = useRef(0);

  // Responsive player scale — smaller on mobile
  const [playerScale, setPlayerScale] = useState(2);
  useEffect(() => {
    const updateScale = () => {
      setPlayerScale(window.innerWidth < 768 ? 1.25 : 2);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Refs for game loop — avoids re-creating rAF on every state change
  const stateRef = useRef(state);
  stateRef.current = state;
  const keysRef = useRef(keys);
  keysRef.current = keys;

  // Sync audio state from useSoundEffects → reducer (single source of truth)
  useEffect(() => {
    dispatch({ type: 'SET_AUDIO_MUTED', muted });
  }, [muted]);

  // Game loop — stable rAF with refs, empty dep array
  useEffect(() => {
    const gameLoop = () => {
      frameRef.current = requestAnimationFrame(gameLoop);
      const now = performance.now();
      if (now - lastFrameTime.current < 16) return; // ~60fps
      lastFrameTime.current = now;

      const s = stateRef.current;
      const k = keysRef.current;

      // Don't process movement when dialog is open
      if (s.dialog.open) return;

      let dx = 0;
      let dy = 0;
      let direction: Direction = s.player.direction;

      // Keyboard input
      if (k.up) { dy = -MOVE_SPEED; direction = 'up'; }
      else if (k.down) { dy = MOVE_SPEED; direction = 'down'; }
      if (k.left) { dx = -MOVE_SPEED; direction = 'left'; }
      else if (k.right) { dx = MOVE_SPEED; direction = 'right'; }

      // Click-to-move path following
      if (!dx && !dy && s.path && s.path.length > 0) {
        const target = s.path[0];
        const tdx = target.x - s.player.x;
        const tdy = target.y - s.player.y;
        const dist = Math.hypot(tdx, tdy);

        if (dist < MOVE_SPEED) {
          dispatch({ type: 'MOVE_PLAYER', x: target.x, y: target.y, direction });
          const newPath = s.path.slice(1);
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

      // Only dispatch SET_MOVING when it actually changes
      if (isMoving !== s.player.isMoving) {
        dispatch({ type: 'SET_MOVING', isMoving });
      }

      let playerX = s.player.x;
      let playerY = s.player.y;

      if (isMoving) {
        const newX = s.player.x + dx;
        const newY = s.player.y + dy;

        if (canMoveTo(newX, newY)) {
          playerX = newX;
          playerY = newY;
          dispatch({ type: 'MOVE_PLAYER', x: newX, y: newY, direction });
        } else {
          dispatch({ type: 'MOVE_PLAYER', x: s.player.x, y: s.player.y, direction });
        }
      }

      // Check building proximity using the latest position
      const nearby = isNearBuilding(playerX, playerY);
      if (nearby?.id !== s.nearbyBuilding?.id) {
        dispatch({ type: 'SET_NEARBY_BUILDING', building: nearby });
      }
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []); // stable — reads from refs

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

  // Virtual d-pad handlers
  const handleDpadDirection = useCallback((dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
    setDirectionKey(dir, pressed);
  }, [setDirectionKey]);

  const handleDpadInteract = useCallback(() => {
    setDirectionKey('interact', true);
    // Auto-release after a short delay (tap behavior)
    setTimeout(() => setDirectionKey('interact', false), 100);
  }, [setDirectionKey]);

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

      {/* Canvas + UI overlay (overlays positioned relative to canvas) */}
      <div className="overworld__game-area" role="img" aria-label="Interactive pixel art village — use arrow keys or WASD to move, press E near buildings to interact">
        <OverworldCanvas state={state} onCanvasClick={handleCanvasClick} playerScale={playerScale} />
        <OverworldUI
          state={state}
          onDialogConfirm={handleDialogConfirm}
          onDialogCancel={handleDialogCancel}
          onToggleAudio={handleToggleAudio}
          onToggleContrast={handleToggleContrast}
          transitioning={transitioning}
        />
      </div>

      {/* Virtual d-pad for touch devices */}
      <VirtualDpad onDirection={handleDpadDirection} onInteract={handleDpadInteract} />

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
