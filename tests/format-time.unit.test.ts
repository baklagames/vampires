import { describe, expect, it } from "vitest";

import { formatSecondsMMSS } from "../src/ui/format-time";

describe("formatSecondsMMSS", () => {
  it("pads minutes and seconds", () => {
    expect(formatSecondsMMSS(0)).toBe("00:00");
    expect(formatSecondsMMSS(5)).toBe("00:05");
    expect(formatSecondsMMSS(65)).toBe("01:05");
  });

  it("clamps negative values", () => {
    expect(formatSecondsMMSS(-4)).toBe("00:00");
  });
});
