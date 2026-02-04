import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { TapToMoveController } from "../src/controllers/tap-to-move";
import { createGridFromMatrix } from "../src/systems/pathfinding";

describe("TapToMoveController", () => {
  it("returns a path and speed for a valid tap", () => {
    const config = ConfigSchema.parse({
      controls: {
        tapToMove: { enabled: true },
      },
      humans: {
        base: {
          walkSpeed: 1.2,
        },
      },
    });
    const grid = createGridFromMatrix([
      [true, true, true],
      [true, false, true],
      [true, true, true],
    ]);
    const controller = new TapToMoveController(config, grid);

    const result = controller.handleTap({ x: 0, y: 0 }, { x: 2, y: 2 });

    expect(result?.path[0]).toEqual({ x: 0, y: 0 });
    expect(result?.path[result.path.length - 1]).toEqual({ x: 2, y: 2 });
    expect(result?.speed).toBe(1.2);
  });

  it("returns null when tap-to-move is disabled", () => {
    const config = ConfigSchema.parse({
      controls: {
        tapToMove: { enabled: false },
      },
    });
    const grid = createGridFromMatrix([[true]]);
    const controller = new TapToMoveController(config, grid);

    const result = controller.handleTap({ x: 0, y: 0 }, { x: 0, y: 0 });

    expect(result).toBeNull();
  });
});
