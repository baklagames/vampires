import { describe, expect, it } from "vitest";

import { hasLineOfSight } from "../src/systems/line-of-sight";

const makeGrid = (blocked: Array<{ x: number; y: number }>) => ({
  width: 5,
  height: 5,
  isBlocked: (x: number, y: number) => blocked.some((cell) => cell.x === x && cell.y === y),
});

describe("line-of-sight", () => {
  it("reports clear path when nothing blocks", () => {
    const grid = makeGrid([]);
    const result = hasLineOfSight(grid, { x: 0, y: 0 }, { x: 4, y: 4 });
    expect(result.clear).toBe(true);
    expect(result.blockedAt).toBeNull();
  });

  it("reports blocked path when obstacle is on the line", () => {
    const grid = makeGrid([{ x: 2, y: 2 }]);
    const result = hasLineOfSight(grid, { x: 0, y: 0 }, { x: 4, y: 4 });
    expect(result.clear).toBe(false);
    expect(result.blockedAt).toEqual({ x: 2, y: 2 });
  });

  it("treats out of bounds as blocked", () => {
    const grid = makeGrid([]);
    const result = hasLineOfSight(grid, { x: 0, y: 0 }, { x: 6, y: 6 });
    expect(result.clear).toBe(false);
    expect(result.blockedAt).toEqual({ x: 5, y: 5 });
  });
});
