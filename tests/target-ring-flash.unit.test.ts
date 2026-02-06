import { describe, expect, it } from "vitest";

import { buildDefaultConfig } from "../src/config/loader";
import { TargetRingFlash } from "../src/ui/target-ring-flash";

describe("TargetRingFlash", () => {
  it("attaches to a target and flashes for config duration", () => {
    const config = buildDefaultConfig();
    config.controls = {
      ...config.controls,
      targetRing: {
        ...config.controls.targetRing,
        flashMs: 200,
      },
    };
    const ring = new TargetRingFlash(config);

    ring.attach("npc-1");
    ring.flash();
    let state = ring.getState();
    expect(state.visible).toBe(true);
    expect(state.targetId).toBe("npc-1");
    expect(state.flashRemainingMs).toBe(200);

    ring.advance(50);
    state = ring.getState();
    expect(state.flashRemainingMs).toBe(150);

    ring.advance(200);
    state = ring.getState();
    expect(state.flashRemainingMs).toBe(0);
  });
});
