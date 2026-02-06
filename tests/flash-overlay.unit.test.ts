import { describe, expect, it } from "vitest";

import { FlashOverlay } from "../src/ui/overlays/FlashOverlay";
import { TOKENS } from "../src/ui/tokens";

describe("FlashOverlay", () => {
  it("fades after trigger", () => {
    const overlay = new FlashOverlay({ maxAlpha: 0.5, fadeMs: 200 });

    overlay.trigger("panic");
    let state = overlay.getState();
    expect(state.alpha).toBeCloseTo(0.5);
    expect(state.color).toBe(TOKENS.colors.danger);

    overlay.advance(100);
    state = overlay.getState();
    expect(state.alpha).toBeCloseTo(0.25);

    overlay.advance(200);
    state = overlay.getState();
    expect(state.alpha).toBe(0);
    expect(state.type).toBeNull();
  });
});
