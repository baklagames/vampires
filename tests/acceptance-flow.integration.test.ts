import { describe, expect, it } from "vitest";

import { NavigationController } from "../src/ui/navigation-controller";
import { NavigationFlow } from "../src/ui/navigation-flow";
import { DeathRespawnController } from "../src/scenes/death-respawn";
import { SceneTransitionManager } from "../src/scenes/scene-transition-manager";

describe("Acceptance Flow", () => {
  it("moves through Start -> Play -> Die -> Restart flow", () => {
    const navigation = new NavigationController({ initialScreen: "splash" });
    const flow = new NavigationFlow(navigation);

    expect(flow.navigate("main-menu")).toBe(true);
    expect(flow.navigate("character-select")).toBe(true);
    expect(flow.navigate("castle")).toBe(true);
    expect(flow.navigate("town")).toBe(true);
    expect(navigation.getCurrent()).toBe("town");

    expect(flow.navigate("death")).toBe(true);
    expect(flow.navigate("castle")).toBe(true);
    expect(navigation.getCurrent()).toBe("castle");
  });

  it("respawns to castle when player dies", () => {
    const manager = new SceneTransitionManager({
      initialScene: "town",
      initialPlayerState: {
        health: 100,
        inventory: {},
        position: { x: 1, y: 1 },
      },
    });
    const controller = new DeathRespawnController(manager, {
      castleSceneKey: "castle",
      castleSpawn: { x: 5, y: 5 },
      respawnHealth: 100,
    });

    const next = controller.handleHealthChange(
      { health: 0, inventory: {}, position: { x: 1, y: 1 } },
      () => {},
    );

    expect(next.position).toEqual({ x: 5, y: 5 });
    expect(manager.getScene()).toBe("castle");
  });
});
