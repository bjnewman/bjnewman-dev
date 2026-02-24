import { describe, it, expect } from 'vitest';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from '../../../components/Overworld/constants';
import { tileMap, buildings, WALKABLE_TILES } from '../../../components/Overworld/mapData';

describe('mapData', () => {
  it('should have correct map dimensions', () => {
    expect(tileMap).toHaveLength(MAP_ROWS);
    tileMap.forEach((row) => {
      expect(row).toHaveLength(MAP_COLS);
    });
  });

  it('should define all 7 buildings', () => {
    expect(buildings).toHaveLength(7);
    const expectedPages = ['/about', '/projects', '/blog', '/resume', '/dashboard', '/carlos', '/holland'];
    const actualPages = buildings.map((b) => b.page);
    expect(actualPages.sort()).toEqual(expectedPages.sort());
  });

  it('should place each building at valid tile coordinates', () => {
    buildings.forEach((building) => {
      expect(building.tileX).toBeGreaterThanOrEqual(0);
      expect(building.tileX).toBeLessThan(MAP_COLS);
      expect(building.tileY).toBeGreaterThanOrEqual(0);
      expect(building.tileY).toBeLessThan(MAP_ROWS);
    });
  });

  it('should have walkable tiles around each building entrance', () => {
    buildings.forEach((building) => {
      const entranceX = building.entranceX;
      const entranceY = building.entranceY;
      const tile = tileMap[entranceY][entranceX];
      expect(WALKABLE_TILES).toContain(tile);
    });
  });

  it('should use TILE_SIZE of 32', () => {
    expect(TILE_SIZE).toBe(32);
  });
});
