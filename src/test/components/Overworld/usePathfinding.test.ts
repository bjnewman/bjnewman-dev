import { describe, it, expect } from 'vitest';
import { findPath } from '../../../components/Overworld/usePathfinding';
import { TILE_SIZE } from '../../../components/Overworld/constants';

describe('pathfinding', () => {
  it('should find a path between two walkable points', () => {
    // From center path to another path point
    const path = findPath(
      { x: 7 * TILE_SIZE, y: 6 * TILE_SIZE },
      { x: 10 * TILE_SIZE, y: 6 * TILE_SIZE }
    );
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
  });

  it('should return null when target is inside a building footprint', () => {
    // Town Hall footprint starts at tileX:6, tileY:0
    const path = findPath(
      { x: 7 * TILE_SIZE, y: 6 * TILE_SIZE },
      { x: 6 * TILE_SIZE, y: 0 * TILE_SIZE }
    );
    expect(path).toBeNull();
  });

  it('should return empty array when start equals target', () => {
    const path = findPath(
      { x: 7 * TILE_SIZE, y: 6 * TILE_SIZE },
      { x: 7 * TILE_SIZE, y: 6 * TILE_SIZE }
    );
    expect(path).toEqual([]);
  });

  it('should return path with target as last point', () => {
    const start = { x: 7 * TILE_SIZE, y: 6 * TILE_SIZE };
    const end = { x: 10 * TILE_SIZE, y: 6 * TILE_SIZE };
    const path = findPath(start, end);
    expect(path).not.toBeNull();
    if (path && path.length > 0) {
      expect(path[path.length - 1].x).toBe(end.x);
      expect(path[path.length - 1].y).toBe(end.y);
    }
  });

  it('should find a path that goes around buildings', () => {
    const path = findPath(
      { x: 5 * TILE_SIZE, y: 6 * TILE_SIZE },
      { x: 12 * TILE_SIZE, y: 6 * TILE_SIZE }
    );
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
  });
});
