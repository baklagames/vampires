import { describe, expect, it } from "vitest";

import {
  createGridFromMatrix,
  createManhattanHeuristic,
  findPath,
} from "../src/systems/pathfinding";

describe("pathfinding", () => {
  it("finds a path around blocked tiles", () => {
    const walkable = [
      [true, true, true],
      [true, false, true],
      [true, true, true],
    ];
    const grid = createGridFromMatrix(walkable);

    const path = findPath(grid, { x: 0, y: 0 }, { x: 2, y: 2 }, {
      allowDiagonal: false,
      movementCost: { straight: 1 },
      heuristic: createManhattanHeuristic(1),
    });

    expect(path).not.toBeNull();
    expect(path?.[0]).toEqual({ x: 0, y: 0 });
    expect(path?.[path.length - 1]).toEqual({ x: 2, y: 2 });
    expect(path?.some((step) => step.x === 1 && step.y === 1)).toBe(false);
  });
});
