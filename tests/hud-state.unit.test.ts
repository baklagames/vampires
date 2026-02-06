import { describe, expect, it } from "vitest";

import { buildHUDState } from "../src/ui/HUDState";

describe("HUDState", () => {
  it("builds HUD state from snapshot input", () => {
    const state = buildHUDState({
      healthPercent: 0.8,
      bloodPercent: 0.6,
      heatLevel: 2,
      heatMax: 6,
      timeLabel: "Night 02:00",
    });

    expect(state.heat.level).toBe(2);
    expect(state.healthBar.percent).toBeCloseTo(0.8);
    expect(state.bloodBar.percent).toBeCloseTo(0.6);
    expect(state.timeOfDay.label).toBe("Time");
  });
});
