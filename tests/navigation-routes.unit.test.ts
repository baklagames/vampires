import { describe, expect, it } from "vitest";

import { isTransitionAllowed } from "../src/ui/navigation-routes";

describe("navigation routes", () => {
  it("allows the main flow transitions", () => {
    expect(isTransitionAllowed("splash", "main-menu")).toBe(true);
    expect(isTransitionAllowed("main-menu", "character-select")).toBe(true);
    expect(isTransitionAllowed("character-select", "castle")).toBe(true);
    expect(isTransitionAllowed("castle", "town")).toBe(true);
  });

  it("blocks invalid transitions", () => {
    expect(isTransitionAllowed("main-menu", "town")).toBe(false);
    expect(isTransitionAllowed("credits", "town")).toBe(false);
  });
});
