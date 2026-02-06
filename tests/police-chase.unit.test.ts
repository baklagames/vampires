import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { PoliceChaseController } from "../src/controllers/police-chase";

describe("PoliceChaseController", () => {
  it("enters chase on spot target", () => {
    const config = ConfigSchema.parse({
      police: { behavior: { patrolSpeed: 1, chaseSpeed: 2, searchDurationSeconds: 3 } },
    });
    const controller = new PoliceChaseController(config);

    const state = controller.spotTarget({ x: 1, y: 1 }, 0);
    expect(state.mode).toBe("chase");
    expect(state.speed).toBe(2);
  });

  it("moves to search then patrol after timeout", () => {
    const config = ConfigSchema.parse({
      police: { behavior: { patrolSpeed: 1, chaseSpeed: 2, searchDurationSeconds: 1 } },
    });
    const controller = new PoliceChaseController(config);

    controller.spotTarget({ x: 1, y: 1 }, 0);
    controller.loseTarget(0);
    const searching = controller.getState();
    expect(searching.mode).toBe("search");

    const patrol = controller.advance(1000);
    expect(patrol.mode).toBe("patrol");
  });
});
