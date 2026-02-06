import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { DetectionController } from "../src/controllers/detection-controller";

const grid = {
  width: 5,
  height: 5,
  isBlocked: () => false,
};

describe("DetectionController", () => {
  it("increases awareness when in cone and LOS", () => {
    const config = ConfigSchema.parse({
      npc: {
        detection: {
          visionRangeTiles: 5,
          visionConeDegrees: 90,
          suspicionSeconds: 2,
          alarmDurationSeconds: 4,
        },
      },
    });
    const controller = new DetectionController(config);

    const state = controller.advance(
      {
        npc: { x: 0, y: 0, facing: { x: 1, y: 0 } },
        player: { x: 3, y: 0 },
      },
      1,
      grid,
    );

    expect(state.inVisionCone).toBe(true);
    expect(state.hasLineOfSight).toBe(true);
    expect(state.awareness).toBeCloseTo(0.5, 3);
  });

  it("decreases awareness when out of cone", () => {
    const config = ConfigSchema.parse({
      npc: {
        detection: {
          visionRangeTiles: 5,
          visionConeDegrees: 60,
          suspicionSeconds: 2,
          alarmDurationSeconds: 2,
        },
      },
    });
    const controller = new DetectionController(config);

    controller.advance(
      {
        npc: { x: 0, y: 0, facing: { x: 1, y: 0 } },
        player: { x: 3, y: 0 },
      },
      1,
      grid,
    );

    const state = controller.advance(
      {
        npc: { x: 0, y: 0, facing: { x: 1, y: 0 } },
        player: { x: 0, y: 3 },
      },
      1,
      grid,
    );

    expect(state.inVisionCone).toBe(false);
    expect(state.awareness).toBeLessThan(1);
  });

  it("does not gain awareness if LOS blocked", () => {
    const config = ConfigSchema.parse({
      npc: {
        detection: {
          visionRangeTiles: 5,
          visionConeDegrees: 120,
          suspicionSeconds: 2,
          alarmDurationSeconds: 2,
        },
      },
    });
    const controller = new DetectionController(config);
    const blockedGrid = {
      width: 5,
      height: 5,
      isBlocked: (x: number, y: number) => x === 1 && y === 0,
    };

    const state = controller.advance(
      {
        npc: { x: 0, y: 0, facing: { x: 1, y: 0 } },
        player: { x: 3, y: 0 },
      },
      1,
      blockedGrid,
    );

    expect(state.hasLineOfSight).toBe(false);
    expect(state.awareness).toBe(0);
  });
});
