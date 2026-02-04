import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { PoliceResponseController } from "../src/controllers/police-response";

describe("PoliceResponseController", () => {
  it("selects walkable spawn points within a fraction of bubble radius", () => {
    const config = ConfigSchema.parse({
      police: {
        spawn: {
          baseCount: 2,
          responseCountPerHeat: 1,
          nightMultiplier: 2,
        },
      },
    });
    const controller = new PoliceResponseController(config);
    const bubble = { x: 10, y: 5, radius: 10 };
    const radiusFraction = 0.2;
    const maxDistance = bubble.radius * radiusFraction;
    const sequence = [0, 0.25, 0.5, 0.75, 0.1, 0.9];
    let index = 0;
    const random = () => {
      const value = sequence[index % sequence.length];
      index += 1;
      return value;
    };

    const points = controller.selectSpawnPoints(
      bubble,
      () => true,
      {
        count: 3,
        radiusJitterFraction: radiusFraction,
        maxAttempts: 10,
        random,
      },
    );

    expect(points).toHaveLength(3);
    for (const point of points) {
      const dx = point.x - bubble.x;
      const dy = point.y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      expect(distance).toBeLessThanOrEqual(maxDistance);
    }
  });

  it("applies night multiplier to spawn count", () => {
    const config = ConfigSchema.parse({
      police: {
        spawn: {
          baseCount: 2,
          responseCountPerHeat: 1,
          nightMultiplier: 2,
        },
      },
    });
    const controller = new PoliceResponseController(config);

    const dayCount = controller.getSpawnCount(2, 2, 1);
    const nightCount = controller.getSpawnCount(
      2,
      2,
      controller.getNightSpawnMultiplier(),
    );

    expect(dayCount).toBe(4);
    expect(nightCount).toBe(8);
  });
});
