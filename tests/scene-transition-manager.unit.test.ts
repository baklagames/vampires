import { describe, expect, it } from "vitest";

import { SceneTransitionManager } from "../src/scenes/scene-transition-manager";

describe("SceneTransitionManager", () => {
  it("persists player state across scene transitions", () => {
    const manager = new SceneTransitionManager({
      initialScene: "town",
      initialPlayerState: {
        health: 10,
        inventory: { blood: 2 },
        position: { x: 1, y: 2 },
      },
    });

    const payload = manager.transition("interior", {
      health: 8,
      inventory: { blood: 3 },
      position: { x: 5, y: 6 },
    });

    expect(payload).toEqual({
      from: "town",
      to: "interior",
      playerState: {
        health: 8,
        inventory: { blood: 3 },
        position: { x: 5, y: 6 },
      },
    });
    expect(manager.getScene()).toBe("interior");
    expect(manager.getPlayerState()).toEqual({
      health: 8,
      inventory: { blood: 3 },
      position: { x: 5, y: 6 },
    });
  });
});
