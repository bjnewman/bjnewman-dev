import type { GameState, GameAction } from './types';
import { SPAWN_X, SPAWN_Y, TILE_SIZE } from './constants';

export const initialGameState: GameState = {
  player: {
    x: SPAWN_X * TILE_SIZE,
    y: SPAWN_Y * TILE_SIZE,
    direction: 'down',
    isMoving: false,
    frame: 0,
  },
  nearbyBuilding: null,
  dialog: { open: false, building: null },
  path: null,
  audio: { muted: true },
  highContrast: false,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE_PLAYER':
      return {
        ...state,
        player: {
          ...state.player,
          x: action.x,
          y: action.y,
          direction: action.direction,
        },
      };
    case 'SET_MOVING':
      return {
        ...state,
        player: { ...state.player, isMoving: action.isMoving },
      };
    case 'SET_FRAME':
      return {
        ...state,
        player: { ...state.player, frame: action.frame },
      };
    case 'SET_NEARBY_BUILDING':
      return { ...state, nearbyBuilding: action.building };
    case 'OPEN_DIALOG':
      return {
        ...state,
        dialog: { open: true, building: action.building },
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        dialog: { open: false, building: null },
      };
    case 'SET_PATH':
      return { ...state, path: action.path };
    case 'TOGGLE_AUDIO':
      return {
        ...state,
        audio: { muted: !state.audio.muted },
      };
    case 'TOGGLE_HIGH_CONTRAST':
      return { ...state, highContrast: !state.highContrast };
    default:
      return state;
  }
}
