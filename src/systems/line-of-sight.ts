export type LineOfSightGrid = {
  width: number;
  height: number;
  isBlocked: (x: number, y: number) => boolean;
};

export type LineOfSightResult = {
  clear: boolean;
  blockedAt: { x: number; y: number } | null;
  checked: Array<{ x: number; y: number }>;
};

export const hasLineOfSight = (
  grid: LineOfSightGrid,
  from: { x: number; y: number },
  to: { x: number; y: number },
): LineOfSightResult => {
  const checked: Array<{ x: number; y: number }> = [];
  const line = bresenhamLine(from.x, from.y, to.x, to.y);

  for (const point of line) {
    if (!isInBounds(grid, point.x, point.y)) {
      return { clear: false, blockedAt: point, checked };
    }
    checked.push(point);
    if (grid.isBlocked(point.x, point.y)) {
      return { clear: false, blockedAt: point, checked };
    }
  }

  return { clear: true, blockedAt: null, checked };
};

const isInBounds = (grid: LineOfSightGrid, x: number, y: number): boolean =>
  x >= 0 && y >= 0 && x < grid.width && y < grid.height;

const bresenhamLine = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Array<{ x: number; y: number }> => {
  const points: Array<{ x: number; y: number }> = [];
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x, y });
    if (x === x1 && y === y1) {
      break;
    }
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return points;
};
