import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { BiteActionController } from "../src/controllers/bite-action";

describe("BiteActionController", () => {
  it("enters feeding state when target is within range", () => {
    const config = ConfigSchema.parse({
      feeding: { bite: { rangeTiles: 2 } },
    });
    const controller = new BiteActionController(config);

    const result = controller.tryBite(
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    );

    expect(result.canBite).toBe(true);
    expect(result.state).toBe("feeding");
  });

  it("stays idle when target is out of range or missing", () => {
    const config = ConfigSchema.parse({
      feeding: { bite: { rangeTiles: 1 } },
    });
    const controller = new BiteActionController(config);

    const far = controller.tryBite({ x: 0, y: 0 }, { x: 2, y: 0 });
    expect(far.canBite).toBe(false);
    expect(far.state).toBe("idle");

    const missing = controller.tryBite({ x: 0, y: 0 }, null);
    expect(missing.canBite).toBe(false);
    expect(missing.state).toBe("idle");
  });
});
