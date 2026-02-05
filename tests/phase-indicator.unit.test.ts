import { describe, expect, it } from "vitest";

import { getPhaseIndicatorState } from "../src/ui/components/PhaseIndicator";

describe("PhaseIndicator", () => {
  it("maps phases to labels", () => {
    expect(getPhaseIndicatorState("day").label).toBe("Day");
    expect(getPhaseIndicatorState("dusk").label).toBe("Dusk");
    expect(getPhaseIndicatorState("night").label).toBe("Night");
    expect(getPhaseIndicatorState("dawn").label).toBe("Dawn");
  });
});
