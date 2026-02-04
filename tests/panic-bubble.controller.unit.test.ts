import { describe, expect, it } from "vitest";

import { PanicBubbleController } from "../src/controllers/panic-bubble";

describe("PanicBubbleController", () => {
  it("removes bubbles after their duration expires", () => {
    const controller = new PanicBubbleController();
    controller.addBubble(10, 5, 3, 5);

    controller.advance(3);
    expect(controller.getBubbleCount()).toBe(1);

    controller.advance(2);
    expect(controller.getBubbleCount()).toBe(0);
  });

  it("applies panic to targets within the bubble radius", () => {
    const controller = new PanicBubbleController();
    controller.addBubble(0, 0, 5, 5);

    const panicCalls: string[] = [];
    const targets = [
      { id: "near", x: 3, y: 4, panic: () => panicCalls.push("near") },
      { id: "far", x: 6, y: 0, panic: () => panicCalls.push("far") },
    ];

    const affected = controller.applyToTargets(targets);

    expect(panicCalls).toEqual(["near"]);
    expect(affected).toEqual(["near"]);
  });
});
