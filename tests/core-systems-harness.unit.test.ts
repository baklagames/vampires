import { describe, expect, it } from "vitest";

import { buildDefaultConfig } from "../src/config/loader";
import { CoreSystemsHarness } from "../src/systems/core-systems-harness";

const createUnsafeMap = () => ({
  width: 1,
  height: 1,
  isSafe: () => false,
  toMask: () => [[false]],
});

describe("CoreSystemsHarness", () => {
  it("applies sun damage after grace period", () => {
    const config = buildDefaultConfig();
    config.sun = {
      ...config.sun,
      enabled: true,
      damagePerSecond: 10,
      graceMs: 100,
    };
    const harness = new CoreSystemsHarness(config);
    const map = createUnsafeMap();
    const context = {
      position: { x: 0, y: 0 },
      sunMap: map,
      phase: "day" as const,
      inPanic: false,
      inChase: false,
    };

    const start = harness.getSnapshot(0, context).player.health;
    harness.advance(50, 50, context);
    expect(harness.getSnapshot(50, context).player.health).toBe(start);

    harness.advance(150, 100, context);
    const after = harness.getSnapshot(150, context).player.health;
    expect(after).toBeLessThan(start);
  });

  it("awards blood on feeding completion", () => {
    const config = buildDefaultConfig();
    config.player = {
      ...config.player,
      stats: { ...config.player.stats, maxBlood: 100 },
      blood: { ...config.player.blood, startingBlood: 0 },
    };
    config.feeding = {
      ...config.feeding,
      bite: { ...config.feeding.bite, baseDurationSeconds: 1 },
      reward: { ...config.feeding.reward, baseBloodGain: 20 },
    };
    const harness = new CoreSystemsHarness(config);
    const map = createUnsafeMap();
    const context = {
      position: { x: 0, y: 0 },
      sunMap: map,
      phase: "night" as const,
      inPanic: false,
      inChase: false,
    };

    const result = harness.startFeeding(0, "npc-1");
    expect(result.accepted).toBe(true);

    harness.advance(1100, 1100, context);
    const blood = harness.getSnapshot(1100, context).player.blood;
    expect(blood).toBe(20);
  });

  it("adds heat over time for panic", () => {
    const config = buildDefaultConfig();
    config.heat = {
      ...config.heat,
      increase: { ...config.heat.increase, perSecondInPanic: 0.5 },
      decay: { ...config.heat.decay, secondsToStartDecay: 10 },
    };
    const harness = new CoreSystemsHarness(config);
    const map = createUnsafeMap();
    const context = {
      position: { x: 0, y: 0 },
      sunMap: map,
      phase: "night" as const,
      inPanic: true,
      inChase: false,
    };

    harness.advance(1000, 1000, context);
    harness.advance(2000, 1000, context);

    const heat = harness.getSnapshot(2000, context).heat.heat;
    expect(heat).toBeCloseTo(1, 3);
  });
});
