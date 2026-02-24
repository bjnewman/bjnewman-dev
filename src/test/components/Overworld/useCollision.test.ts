import { describe, it, expect } from 'vitest';
import { canMoveTo, getTileAt, isNearBuilding } from '../../../components/Overworld/useCollision';
import { TileType } from '../../../components/Overworld/types';
import { buildings } from '../../../components/Overworld/mapData';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from '../../../components/Overworld/constants';

describe('collision detection', () => {
  it('should allow movement to grass tiles not blocked by buildings', () => {
    // Spawn point (8, 8) should be walkable grass
    expect(canMoveTo(8 * TILE_SIZE, 8 * TILE_SIZE)).toBe(true);
  });

  it('should allow movement to path tiles', () => {
    // Row 6 is the horizontal path
    expect(canMoveTo(5 * TILE_SIZE, 6 * TILE_SIZE)).toBe(true);
  });

  it('should block movement into building footprints', () => {
    const building = buildings[0]; // Town Hall at tileX:6, tileY:0
    expect(canMoveTo(building.tileX * TILE_SIZE, building.tileY * TILE_SIZE)).toBe(false);
  });

  it('should block movement outside map bounds', () => {
    expect(canMoveTo(-TILE_SIZE, 0)).toBe(false);
    expect(canMoveTo(0, -TILE_SIZE)).toBe(false);
    expect(canMoveTo(MAP_COLS * TILE_SIZE, 0)).toBe(false);
    expect(canMoveTo(0, MAP_ROWS * TILE_SIZE)).toBe(false);
  });

  it('should detect when player is near a building entrance', () => {
    const building = buildings[0]; // Town Hall
    const nearX = building.entranceX * TILE_SIZE;
    const nearY = building.entranceY * TILE_SIZE;
    const result = isNearBuilding(nearX, nearY);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('town-hall');
  });

  it('should return null when player is far from buildings', () => {
    // Center of the map on the path, away from entrances
    const result = isNearBuilding(8 * TILE_SIZE, 8 * TILE_SIZE);
    expect(result).toBeNull();
  });

  it('should return correct tile type', () => {
    expect(getTileAt(0, 0)).toBeDefined();
  });

  it('should return null for out-of-bounds coordinates', () => {
    expect(getTileAt(-1, 0)).toBeNull();
    expect(getTileAt(0, MAP_ROWS * TILE_SIZE + 1)).toBeNull();
  });
});
