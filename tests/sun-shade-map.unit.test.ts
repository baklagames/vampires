import { describe, expect, it } from "vitest";

import {
  createDynamicSunShadeMap,
  createSunShadeMap,
} from "../src/systems/sun-shade-map";

describe("sun-shade map", () => {
  it("marks tiles with interior metadata as safe", () => {
    const map = createSunShadeMap({
      width: 3,
      height: 3,
      layers: [
        {
          name: "base",
          tiles: [
            [null, null, null],
            [null, null, null],
            [null, null, null],
          ],
        },
        {
          name: "interior",
          properties: { interior: true },
          tiles: [
            [null, null, null],
            [null, { properties: {} }, null],
            [null, null, null],
          ],
        },
        {
          name: "shadow",
          tiles: [
            [null, null, null],
            [null, null, null],
            [null, null, { properties: { shadow: true } }],
          ],
        },
      ],
    });

    expect(map.isSafe(1, 1)).toBe(true);
    expect(map.isSafe(2, 2)).toBe(true);
    expect(map.isSafe(0, 0)).toBe(false);
  });

  it("updates outdoor safety on phase change", () => {
    const map = createDynamicSunShadeMap({
      width: 2,
      height: 1,
      layers: [
        {
          name: "base",
          tiles: [[{ properties: {} }, { properties: {} }]],
        },
      ],
    });

    expect(map.isSafe(0, 0)).toBe(false);

    map.setPhase("night");
    expect(map.isSafe(0, 0)).toBe(true);

    map.setPhase("dawn");
    expect(map.isSafe(0, 0)).toBe(false);
  });
});
