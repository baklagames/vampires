import { describe, expect, it } from "vitest";

import { buildDefaultConfig } from "../src/config/loader";
import { OverlayManager } from "../src/ui/overlays/OverlayManager";

describe("OverlayManager", () => {
  it("advances flash and tap marker timers", () => {
    const config = buildDefaultConfig();
    const overlays = new OverlayManager(config);
    overlays.flash.trigger("panic");
    overlays.tapMarker.trigger(10, 10, 100);

    overlays.advance(50);
    expect(overlays.tapMarker.getState().remainingMs).toBe(50);

    overlays.advance(60);
    expect(overlays.tapMarker.getState().visible).toBe(false);
  });
});
