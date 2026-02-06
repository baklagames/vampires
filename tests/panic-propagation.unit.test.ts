import { describe, expect, it, vi } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { PanicPropagationController } from "../src/controllers/panic-propagation";

describe("PanicPropagationController", () => {
  it("propagates panic to targets within bubble", () => {
    const config = ConfigSchema.parse({
      panic: {
        witness: {
          panicSpreadWithinBubble: true,
        },
        bubble: {
          radiusTiles: 4,
        },
      },
    });
    const controller = new PanicPropagationController(config, { cellSize: 2 });
    const onPanicA = vi.fn();
    const onPanicB = vi.fn();

    controller.upsertTarget({ id: "a", position: { x: 1, y: 1 }, panic: onPanicA });
    controller.upsertTarget({ id: "b", position: { x: 10, y: 10 }, panic: onPanicB });

    const affected = controller.propagate([
      { id: "bubble-1", x: 0, y: 0, radius: 3 },
    ]);

    expect(affected).toEqual(["a"]);
    expect(onPanicA).toHaveBeenCalled();
    expect(onPanicB).not.toHaveBeenCalled();
  });
});
