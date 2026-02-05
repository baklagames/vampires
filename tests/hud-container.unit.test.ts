import { describe, expect, it } from "vitest";

import { buildHUDState } from "../src/ui/HUDContainer";

describe("HUDContainer", () => {
  it("lays out HUD elements within safe padding", () => {
    const state = buildHUDState(
      { current: 50, max: 100 },
      "day",
      { screenWidth: 390, screenHeight: 844 },
    );

    expect(state.layout.bloodBar.x).toBeGreaterThan(0);
    expect(state.layout.actionBar.y).toBeGreaterThan(0);
    expect(state.layout.actionBar.width).toBe(390 - 32);
  });
});
