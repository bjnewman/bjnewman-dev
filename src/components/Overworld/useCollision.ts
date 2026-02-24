import type { Building, TileTypeValue } from './types';
import { tileMap, buildings, collisionMap, WALKABLE_TILES } from './mapData';
import { TILE_SIZE, MAP_COLS, MAP_ROWS, INTERACTION_RANGE } from './constants';

export function getTileAt(pixelX: number, pixelY: number): TileTypeValue | null {
  const tileX = Math.floor(pixelX / TILE_SIZE);
  const tileY = Math.floor(pixelY / TILE_SIZE);
  if (tileX < 0 || tileX >= MAP_COLS || tileY < 0 || tileY >= MAP_ROWS) {
    return null;
  }
  return tileMap[tileY][tileX];
}

export function canMoveTo(pixelX: number, pixelY: number): boolean {
  const tileX = Math.floor(pixelX / TILE_SIZE);
  const tileY = Math.floor(pixelY / TILE_SIZE);
  if (tileX < 0 || tileX >= MAP_COLS || tileY < 0 || tileY >= MAP_ROWS) {
    return false;
  }
  // Check terrain walkability
  const tile = tileMap[tileY][tileX];
  if (!WALKABLE_TILES.includes(tile)) return false;
  // Check building collision overlay
  if (collisionMap[tileY][tileX]) return false;
  return true;
}

export function getBuildingAtPixel(pixelX: number, pixelY: number): Building | null {
  const tileX = Math.floor(pixelX / TILE_SIZE);
  const tileY = Math.floor(pixelY / TILE_SIZE);

  for (const building of buildings) {
    if (
      tileX >= building.tileX &&
      tileX < building.tileX + building.footprintW &&
      tileY >= building.tileY &&
      tileY < building.tileY + building.footprintH
    ) {
      return building;
    }
  }
  return null;
}

export function isNearBuilding(pixelX: number, pixelY: number): Building | null {
  const playerTileX = Math.floor(pixelX / TILE_SIZE);
  const playerTileY = Math.floor(pixelY / TILE_SIZE);

  for (const building of buildings) {
    const dx = Math.abs(playerTileX - building.entranceX);
    const dy = Math.abs(playerTileY - building.entranceY);
    if (dx <= INTERACTION_RANGE && dy <= INTERACTION_RANGE) {
      return building;
    }
  }
  return null;
}
