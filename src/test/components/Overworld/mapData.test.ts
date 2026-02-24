import { describe, it, expect } from 'vitest';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from '../../../components/Overworld/constants';
import { tileMap, buildings, collisionMap, WALKABLE_TILES } from '../../../components/Overworld/mapData';

describe('mapData', () => {
  it('should have correct map dimensions', () => {
    expect(tileMap).toHaveLength(MAP_ROWS);
    tileMap.forEach((row) => {
      expect(row).toHaveLength(MAP_COLS);
    });
  });

  it('should use TILE_SIZE of 64', () => {
    expect(TILE_SIZE).toBe(64);
  });

  it('should define all 7 buildings', () => {
    expect(buildings).toHaveLength(7);
    const expectedPages = ['/about', '/projects', '/blog', '/resume', '/dashboard', '/carlos', '/holland'];
    const actualPages = buildings.map((b) => b.page);
    expect(actualPages.sort()).toEqual(expectedPages.sort());
  });

  it('should place each building footprint within map bounds', () => {
    buildings.forEach((building) => {
      expect(building.tileX).toBeGreaterThanOrEqual(0);
      expect(building.tileX + building.footprintW).toBeLessThanOrEqual(MAP_COLS);
      expect(building.tileY).toBeGreaterThanOrEqual(0);
      expect(building.tileY + building.footprintH).toBeLessThanOrEqual(MAP_ROWS);
    });
  });

  it('should have walkable entrance tiles (not blocked by collision map)', () => {
    buildings.forEach((building) => {
      const tile = tileMap[building.entranceY][building.entranceX];
      expect(WALKABLE_TILES).toContain(tile);
      expect(collisionMap[building.entranceY][building.entranceX]).toBe(false);
    });
  });

  it('should have each building with sprite asset info', () => {
    buildings.forEach((building) => {
      expect(building.spriteAsset).toBeTruthy();
      expect(building.spriteWidth).toBeGreaterThan(0);
      expect(building.spriteHeight).toBeGreaterThan(0);
    });
  });

  it('should mark building footprint tiles as blocked in collision map', () => {
    buildings.forEach((building) => {
      // At least one interior footprint tile should be blocked
      const interiorX = building.tileX;
      const interiorY = building.tileY;
      expect(collisionMap[interiorY][interiorX]).toBe(true);
    });
  });

  it('should have collision map with correct dimensions', () => {
    expect(collisionMap).toHaveLength(MAP_ROWS);
    collisionMap.forEach((row) => {
      expect(row).toHaveLength(MAP_COLS);
    });
  });
});
