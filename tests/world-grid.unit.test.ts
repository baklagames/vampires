import { describe, expect, it } from "vitest";

import { createWorldGrid, type TiledMap } from "../src/systems/world-grid";

const buildMap = (): TiledMap => ({
  width: 2,
  height: 2,
  tilewidth: 16,
  tileheight: 16,
  layers: [
    {
      name: "Ground",
      type: "tilelayer",
      width: 2,
      height: 2,
      data: [1, 1, 1, 1],
    },
    {
      name: "Buildings",
      type: "tilelayer",
      width: 2,
      height: 2,
      data: [0, 1, 0, 0],
    },
    {
      name: "Shadow",
      type: "tilelayer",
      width: 2,
      height: 2,
      data: [0, 1, 0, 0],
      properties: [{ name: "safeZone", type: "bool", value: true }],
    },
  ],
});

describe("world-grid", () => {
  it("builds walkable/blocked masks from layers", () => {
    const grid = createWorldGrid(buildMap());
    expect(grid.walkableMask[0][0]).toBe(true);
    expect(grid.walkableMask[0][1]).toBe(false);
    expect(grid.isLineBlocked(1, 0)).toBe(true);
  });

  it("marks sun-safe tiles from layer properties", () => {
    const grid = createWorldGrid(buildMap());
    expect(grid.isSunSafe(1, 0)).toBe(true);
    expect(grid.isSunSafe(0, 0)).toBe(false);
  });

  it("converts world and tile coordinates", () => {
    const grid = createWorldGrid(buildMap());
    expect(grid.worldToTile(17, 1)).toEqual({ x: 1, y: 0 });
    expect(grid.tileToWorld(1, 1)).toEqual({ x: 24, y: 24 });
  });
});
