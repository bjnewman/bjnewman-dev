import type { Point } from './types';
import { canMoveTo } from './useCollision';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './constants';

type Node = {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
};

function heuristic(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function nodeKey(x: number, y: number): string {
  return `${x},${y}`;
}

const DIRECTIONS = [
  { dx: 0, dy: -1 }, // up
  { dx: 0, dy: 1 },  // down
  { dx: -1, dy: 0 }, // left
  { dx: 1, dy: 0 },  // right
];

export function findPath(start: Point, end: Point): Point[] | null {
  const startTileX = Math.floor(start.x / TILE_SIZE);
  const startTileY = Math.floor(start.y / TILE_SIZE);
  const endTileX = Math.floor(end.x / TILE_SIZE);
  const endTileY = Math.floor(end.y / TILE_SIZE);

  // Same tile
  if (startTileX === endTileX && startTileY === endTileY) return [];

  // Target must be walkable
  if (!canMoveTo(end.x, end.y)) return null;

  const open: Node[] = [];
  const closed = new Set<string>();

  const startNode: Node = {
    x: startTileX,
    y: startTileY,
    g: 0,
    h: heuristic({ x: startTileX, y: startTileY }, { x: endTileX, y: endTileY }),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  open.push(startNode);

  while (open.length > 0) {
    // Find node with lowest f
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    const key = nodeKey(current.x, current.y);

    if (current.x === endTileX && current.y === endTileY) {
      // Reconstruct path
      const path: Point[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift({ x: node.x * TILE_SIZE, y: node.y * TILE_SIZE });
        node = node.parent;
      }
      // Remove start position from path (player is already there)
      path.shift();
      return path;
    }

    closed.add(key);

    for (const dir of DIRECTIONS) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;

      if (nx < 0 || nx >= MAP_COLS || ny < 0 || ny >= MAP_ROWS) continue;
      if (closed.has(nodeKey(nx, ny))) continue;
      if (!canMoveTo(nx * TILE_SIZE, ny * TILE_SIZE)) continue;

      const g = current.g + 1;
      const h = heuristic({ x: nx, y: ny }, { x: endTileX, y: endTileY });
      const f = g + h;

      const existingIdx = open.findIndex((n) => n.x === nx && n.y === ny);
      if (existingIdx >= 0 && open[existingIdx].g <= g) continue;

      if (existingIdx >= 0) open.splice(existingIdx, 1);

      open.push({ x: nx, y: ny, g, h, f, parent: current });
    }
  }

  return null; // No path found
}
