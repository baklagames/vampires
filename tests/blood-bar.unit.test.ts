import { describe, expect, it } from "vitest";

import { getBloodBarState } from "../src/ui/components/BloodBar";
import { TOKENS } from "../src/ui/tokens";

describe("BloodBar", () => {
  it("maps values to percentage and color thresholds", () => {
    const healthy = getBloodBarState(80, 100);
    expect(healthy.percent).toBeCloseTo(0.8);
    expect(healthy.color).toBe(TOKENS.colors.success);

    const caution = getBloodBarState(40, 100);
    expect(caution.percent).toBeCloseTo(0.4);
    expect(caution.color).toBe(TOKENS.colors.warning);

    const critical = getBloodBarState(10, 100);
    expect(critical.percent).toBeCloseTo(0.1);
    expect(critical.color).toBe(TOKENS.colors.danger);
  });
});
