import { describe, expect, it } from "vitest";

import { SpatialHash } from "../src/systems/spatial-hash";

describe("SpatialHash", () => {
  it("returns neighbors within radius", () => {
    const hash = new SpatialHash(5);
    hash.upsert({ id: "a", position: { x: 0, y: 0 } });
    hash.upsert({ id: "b", position: { x: 3, y: 4 } });
    hash.upsert({ id: "c", position: { x: 20, y: 20 } });

    const results = hash.queryRadius({ x: 0, y: 0 }, 6);
    const ids = results.map((entry) => entry.id).sort();

    expect(ids).toEqual(["a", "b"]);
  });

  it("updates entry cell on move", () => {
    const hash = new SpatialHash(5);
    hash.upsert({ id: "a", position: { x: 0, y: 0 } });
    hash.upsert({ id: "a", position: { x: 10, y: 0 } });

    const results = hash.queryRadius({ x: 0, y: 0 }, 3);
    expect(results.map((entry) => entry.id)).toEqual([]);
  });
});
