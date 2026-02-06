import { describe, expect, it } from "vitest";

import { buildDefaultConfig } from "../src/config/loader";
import { PoliceSpawner } from "../src/controllers/police-spawner";

describe("PoliceSpawner", () => {
  it("creates spawn plan based on heat and phase multiplier", () => {
    const config = buildDefaultConfig();
    config.police = {
      ...config.police,
      spawn: {
        ...config.police.spawn,
        baseCount: 1,
        responseCountPerHeat: 2,
        nightMultiplier: 2,
      },
      behavior: {
        ...config.police.behavior,
        responseDelaySeconds: 1,
        spawnRadiusJitterFraction: 1,
        spawnMaxAttempts: 5,
      },
    };
    const spawner = new PoliceSpawner(config);
    const bubble = { x: 0, y: 0, radius: 5 };
    const plan = spawner.createSpawnPlan(
      bubble,
      2,
      2,
      0,
      () => true,
      () => 0,
    );

    expect(plan.count).toBe(10);
    expect(plan.points.length).toBeLessThanOrEqual(10);
    expect(plan.nextAllowedAtMs).toBe(1000);
  });

  it("respects response delay", () => {
    const config = buildDefaultConfig();
    config.police = {
      ...config.police,
      behavior: {
        ...config.police.behavior,
        responseDelaySeconds: 2,
        spawnRadiusJitterFraction: 1,
        spawnMaxAttempts: 3,
      },
    };
    const spawner = new PoliceSpawner(config);
    const bubble = { x: 0, y: 0, radius: 5 };

    const first = spawner.createSpawnPlan(
      bubble,
      0,
      1,
      0,
      () => true,
      () => 0,
    );
    const second = spawner.createSpawnPlan(
      bubble,
      0,
      1,
      1000,
      () => true,
      () => 0,
    );

    expect(first.count).toBeGreaterThanOrEqual(0);
    expect(second.count).toBe(0);
  });
});
