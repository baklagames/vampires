import { describe, expect, it } from "vitest";

import { CastleScene } from "../src/scenes/castle";
import { InteriorScene } from "../src/scenes/interior";

describe("InteriorScene and CastleScene", () => {
  it("loads assets and configures collision", () => {
    const interior = new InteriorScene({
      tilemapKey: "interior",
      tilemapPath: "interior.json",
      tilesetKey: "tiles",
      tilesetPath: "tiles.png",
    });
    const castle = new CastleScene({
      tilemapKey: "castle",
      tilemapPath: "castle.json",
      tilesetKey: "tiles",
      tilesetPath: "tiles.png",
    });

    const calls: string[] = [];
    const context = {
      loadTilemap: (key: string, path: string) => {
        calls.push(`tilemap:${key}:${path}`);
      },
      loadTileset: (key: string, path: string) => {
        calls.push(`tileset:${key}:${path}`);
      },
      makeTilemap: (key: string) => {
        calls.push(`make:${key}`);
        return { key };
      },
      addTileset: (_map: unknown, key: string) => {
        calls.push(`add:${key}`);
        return { key };
      },
      createLayer: (_map: unknown, name: string) => {
        calls.push(`layer:${name}`);
        return { name };
      },
      setupCollision: (layer: { name: string }) => {
        calls.push(`collision:${layer.name}`);
      },
      onExit: () => {
        calls.push("exit");
      },
    };

    interior.preload(context);
    interior.create(context);
    interior.triggerExit(context);

    castle.preload(context);
    castle.create(context);
    castle.triggerExit(context);

    expect(calls).toContain("collision:Obstacles");
    expect(calls).toContain("exit");
  });
});
