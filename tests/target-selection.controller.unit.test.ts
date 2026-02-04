import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { TargetSelectionController } from "../src/controllers/target-selection";

describe("TargetSelectionController", () => {
  it("selects and clears targets based on taps", () => {
    const config = ConfigSchema.parse({
      controls: {
        tapToTarget: { enabled: true },
      },
    });
    const controller = new TargetSelectionController(config);

    const first = controller.handleTap("npc-1");
    expect(first).toEqual({ selectedId: "npc-1", action: "select" });

    const clear = controller.handleTap(null);
    expect(clear).toEqual({ selectedId: null, action: "clear" });
  });

  it("keeps selection when tapping the same target", () => {
    const config = ConfigSchema.parse({
      controls: {
        tapToTarget: { enabled: true },
      },
    });
    const controller = new TargetSelectionController(config);

    controller.handleTap("npc-1");
    const second = controller.handleTap("npc-1");

    expect(second).toEqual({ selectedId: "npc-1", action: "select" });
  });

  it("returns move action when tap-to-target is disabled", () => {
    const config = ConfigSchema.parse({
      controls: {
        tapToTarget: { enabled: false },
      },
    });
    const controller = new TargetSelectionController(config);

    const result = controller.handleTap("npc-1");

    expect(result).toEqual({ selectedId: null, action: "move" });
  });
});
