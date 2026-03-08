import { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { gameReducer, initialGameState } from './gameReducer';
import { useInput } from './useInput';
import { useSoundEffects } from './useSoundEffects';
import { canMoveTo, isNearBuilding } from './useCollision';
import { findPath } from './usePathfinding';
import type { Building } from './types';
import { OverworldCanvas } from './OverworldCanvas';
import { useAtmosphere } from '../Atmosphere/useAtmosphere';
import { OverworldUI } from './OverworldUI';
import { OverworldSettingsPanel } from './OverworldSettingsPanel';
import { VirtualDpad } from './VirtualDpad';
import { AccessibleNav, TextOnlyFallback } from './AccessibleNav';
import { WelcomeModal } from './WelcomeModal';
// import { useKonamiCode } from './EasterEggs';
// import { useConfetti } from '../ConfettiCannon';
import { MOVE_SPEED, TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { buildings } from './mapData';
import type { Direction } from './types';
import { setIrisCenter } from '../transitions';

export function Overworld() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { keys, clickTarget, handleCanvasClick, clearClickTarget, clearInteract, clearEscape, setDirectionKey } = useInput();
  const { muted, toggleMute, playDialogOpen, playConfirm, playCancel, playTransition, playSound } = useSoundEffects();
  const atmosphere = useAtmosphere();
  const { dayProgress, season, weatherEnabled, weatherOverrides } = atmosphere;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [textMode, setTextMode] = useState(false);
  
  // Welcome modal state
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('welcome-seen');
    }
    return false;
  });
  const isWelcomeOpenRef = useRef(isWelcomeOpen);
  const settingsOpenRef = useRef(settingsOpen);

  // Keep refs synced
  useEffect(() => {
    isWelcomeOpenRef.current = isWelcomeOpen;
  }, [isWelcomeOpen]);
  useEffect(() => {
    settingsOpenRef.current = settingsOpen;
  }, [settingsOpen]);

  // When a building is double-clicked, pathfind there and auto-interact on arrival
  const pendingInteractRef = useRef<Building | null>(null);

  // Konami code easter egg — disabled pending debugging
  // const { fireConfetti, ConfettiRender } = useConfetti();
  // useKonamiCode(fireConfetti);
  const frameRef = useRef<number>(0);
  const lastFrameTime = useRef(0);

  // Responsive player scale — smaller on mobile
  const [playerScale, setPlayerScale] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 1.25 : 2
  );
  useEffect(() => {
    const updateScale = () => {
      const next = window.innerWidth < 768 ? 1.25 : 2;
      setPlayerScale((prev) => prev === next ? prev : next);
    };
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Spawn at building entrance when returning from an interior page
  useEffect(() => {
    const spawnId = localStorage.getItem('overworld-spawn');
    if (!spawnId) return;
    localStorage.removeItem('overworld-spawn');
    const building = buildings.find((b) => b.id === spawnId);
    if (!building) return;
    dispatch({
      type: 'MOVE_PLAYER',
      x: building.entranceX * TILE_SIZE,
      y: building.entranceY * TILE_SIZE,
      direction: 'down',
    });
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

      // Don't process movement when dialog, welcome modal, or settings panel is open
      if (s.dialog.open || isWelcomeOpenRef.current || settingsOpenRef.current) return;

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

      // Auto-interact when arriving at a double-clicked building
      if (pendingInteractRef.current && nearby?.id === pendingInteractRef.current.id && !s.dialog.open) {
        dispatch({ type: 'OPEN_DIALOG', building: nearby });
        dispatch({ type: 'SET_PATH', path: null });
        pendingInteractRef.current = null;
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

  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleDialogConfirm = useCallback(() => {
    if (!state.dialog.building) return;
    playConfirm();

    const building = state.dialog.building;
    localStorage.setItem('overworld-spawn', building.id);

    // Convert canvas coordinates to viewport coordinates
    const cx = building.entranceX * TILE_SIZE + TILE_SIZE / 2;
    const cy = building.entranceY * TILE_SIZE;
    const wrapper = canvasWrapperRef.current ?? document.querySelector('.overworld__canvas-wrapper');
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const viewportX = rect.left + cx * (rect.width / CANVAS_WIDTH);
      const viewportY = rect.top + cy * (rect.height / CANVAS_HEIGHT);
      setIrisCenter(viewportX, viewportY, 'enter');
    }

    dispatch({ type: 'CLOSE_DIALOG' });
    playTransition();

    // Navigate using Astro's client-side router
    import('astro:transitions/client')
      .then(({ navigate }) => navigate(building.page))
      .catch(() => { window.location.href = building.page; });
  }, [state.dialog.building, playConfirm, playTransition]);

  const handleBuildingDoubleClick = useCallback((building: Building) => {
    if (state.dialog.open) return;
    // If already near the building, open dialog immediately
    if (state.nearbyBuilding?.id === building.id) {
      playDialogOpen();
      dispatch({ type: 'OPEN_DIALOG', building });
      return;
    }
    // Otherwise pathfind to entrance and auto-interact on arrival
    const path = findPath(
      { x: state.player.x, y: state.player.y },
      { x: building.entranceX * TILE_SIZE, y: building.entranceY * TILE_SIZE }
    );
    dispatch({ type: 'SET_PATH', path });
    pendingInteractRef.current = building;
  }, [state.dialog.open, state.nearbyBuilding, state.player.x, state.player.y, playDialogOpen]);

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
      <div className="overworld overworld--text-mode">
        <button className="overworld__text-toggle" onClick={handleToggleTextMode} type="button">
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
        <OverworldCanvas ref={canvasWrapperRef} state={state} onCanvasClick={handleCanvasClick} onBuildingDoubleClick={handleBuildingDoubleClick} playSound={playSound} playerScale={playerScale} dayProgress={dayProgress} season={season} weatherEnabled={weatherEnabled} weatherOverrides={weatherOverrides} />
        <OverworldUI
          state={state}
          onDialogConfirm={handleDialogConfirm}
          onDialogCancel={handleDialogCancel}
          onToggleAudio={handleToggleAudio}
          onToggleContrast={handleToggleContrast}
          onToggleSettings={() => setSettingsOpen((prev) => !prev)}
          transitioning={false}
        />
      </div>

      {/* Settings panel (Cmd+K) */}
      <OverworldSettingsPanel
        atmosphere={atmosphere}
        isOpen={settingsOpen}
        onToggle={setSettingsOpen}
      />

      {/* Virtual d-pad for touch devices */}
      <VirtualDpad onDirection={handleDpadDirection} onInteract={handleDpadInteract} />

      {/* Accessible tab-based nav (hidden visually, available to screen readers) */}
      <div id="overworld-nav">
        <AccessibleNav />
      </div>

      <WelcomeModal
        onPlay={() => setIsWelcomeOpen(false)}
        onSkip={() => {
          setIsWelcomeOpen(false);
          setTextMode(true);
        }}
      />

      {/* Konami code confetti — disabled pending debugging
      <ConfettiRender />
      */}

      {/* noscript fallback */}
      <noscript>
        <TextOnlyFallback />
      </noscript>
    </div>
  );
}

export default Overworld;
