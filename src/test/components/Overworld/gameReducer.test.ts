import { describe, it, expect } from 'vitest';
import { gameReducer, initialGameState } from '../../../components/Overworld/gameReducer';
import { buildings } from '../../../components/Overworld/mapData';

describe('gameReducer', () => {
  it('should have correct initial state', () => {
    expect(initialGameState.player.isMoving).toBe(false);
    expect(initialGameState.player.direction).toBe('down');
    expect(initialGameState.dialog.open).toBe(false);
    expect(initialGameState.nearbyBuilding).toBeNull();
    expect(initialGameState.path).toBeNull();
    expect(initialGameState.audio.muted).toBe(true);
    expect(initialGameState.highContrast).toBe(false);
  });

  it('should handle MOVE_PLAYER', () => {
    const state = gameReducer(initialGameState, {
      type: 'MOVE_PLAYER',
      x: 100,
      y: 200,
      direction: 'right',
    });
    expect(state.player.x).toBe(100);
    expect(state.player.y).toBe(200);
    expect(state.player.direction).toBe('right');
  });

  it('should handle SET_MOVING', () => {
    const state = gameReducer(initialGameState, { type: 'SET_MOVING', isMoving: true });
    expect(state.player.isMoving).toBe(true);
  });

  it('should handle SET_FRAME', () => {
    const state = gameReducer(initialGameState, { type: 'SET_FRAME', frame: 2 });
    expect(state.player.frame).toBe(2);
  });

  it('should handle SET_NEARBY_BUILDING', () => {
    const building = buildings[0];
    const state = gameReducer(initialGameState, { type: 'SET_NEARBY_BUILDING', building });
    expect(state.nearbyBuilding?.id).toBe(building.id);
  });

  it('should handle OPEN_DIALOG', () => {
    const building = buildings[0];
    const state = gameReducer(initialGameState, { type: 'OPEN_DIALOG', building });
    expect(state.dialog.open).toBe(true);
    expect(state.dialog.building?.id).toBe(building.id);
  });

  it('should handle CLOSE_DIALOG', () => {
    const withDialog = gameReducer(initialGameState, { type: 'OPEN_DIALOG', building: buildings[0] });
    const state = gameReducer(withDialog, { type: 'CLOSE_DIALOG' });
    expect(state.dialog.open).toBe(false);
    expect(state.dialog.building).toBeNull();
  });

  it('should handle SET_PATH', () => {
    const path = [{ x: 100, y: 200 }, { x: 132, y: 200 }];
    const state = gameReducer(initialGameState, { type: 'SET_PATH', path });
    expect(state.path).toEqual(path);
  });

  it('should handle SET_AUDIO_MUTED', () => {
    const state = gameReducer(initialGameState, { type: 'SET_AUDIO_MUTED', muted: false });
    expect(state.audio.muted).toBe(false);

    const state2 = gameReducer(state, { type: 'SET_AUDIO_MUTED', muted: true });
    expect(state2.audio.muted).toBe(true);
  });

  it('should handle TOGGLE_HIGH_CONTRAST', () => {
    const state = gameReducer(initialGameState, { type: 'TOGGLE_HIGH_CONTRAST' });
    expect(state.highContrast).toBe(true);
  });
});
