import { describe, expect, it } from "vitest";

import { DeathRespawnController } from "../src/scenes/death-respawn";
import { SceneTransitionManager } from "../src/scenes/scene-transition-manager";

describe("DeathRespawnController", () => {
  it("transitions to castle and resets health on death", () => {
    const manager = new SceneTransitionManager({
      initialScene: "town",
      initialPlayerState: {
        health: 1,
        inventory: { blood: 0 },
        position: { x: 1, y: 1 },
      },
    });
    const controller = new DeathRespawnController(manager, {
      castleSceneKey: "castle",
      castleSpawn: { x: 5, y: 6 },
      respawnHealth: 10,
    });

    let faded = false;
    const nextState = controller.handleHealthChange(
      { health: 0, inventory: { blood: 0 }, position: { x: 2, y: 3 } },
      () => {
        faded = true;
      },
    );

    expect(faded).toBe(true);
    expect(manager.getScene()).toBe("castle");
    expect(nextState).toEqual({
      health: 10,
      inventory: { blood: 0 },
      position: { x: 5, y: 6 },
    });
  });
});
