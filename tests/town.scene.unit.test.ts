import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { TownScene } from "../src/scenes/town";

describe("TownScene", () => {
  it("spawns NPCs based on density multiplier and available points", () => {
    const config = ConfigSchema.parse({
      performance: {
        maxActiveNpcs: {
          town: 10,
        },
      },
      dayNight: {
        npcDensity: {
          dayMultiplier: 0.5,
          nightMultiplier: 0.5,
        },
      },
    });
    const scene = new TownScene({
      assets: {
        tilemap: { key: "town", jsonPath: "town.json" },
        tileset: { key: "tiles", imagePath: "tiles.png" },
        playerSheet: { key: "player", imagePath: "player.png", frameWidth: 16, frameHeight: 16 },
        npcSheet: { key: "npc", imagePath: "npc.png", frameWidth: 16, frameHeight: 16 },
      },
      layerNames: ["Ground"],
      config,
    });

    const spawned: Array<{ x: number; y: number }> = [];
    scene.create({
      makeTilemap: () => ({}),
      addTileset: () => ({}),
      createLayer: () => ({}),
      cameraFollow: () => {},
      player: {},
      npcSpawn: {
        dayNightController: { getNpcDensityMultiplier: () => 0.5 },
        npcPool: {
          spawnAt: (x, y) => spawned.push({ x, y }),
          getActiveCount: () => 0,
        },
        walkablePoints: () => [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 3 },
          { x: 4, y: 4 },
          { x: 5, y: 5 },
        ],
      },
    });

    expect(spawned).toHaveLength(5);
    expect(spawned[0]).toEqual({ x: 1, y: 1 });
  });

  it("wires controller updates and phase change callbacks", () => {
    const config = ConfigSchema.parse({
      performance: {
        maxActiveNpcs: {
          town: 1,
        },
      },
    });
    const scene = new TownScene({
      assets: {
        tilemap: { key: "town", jsonPath: "town.json" },
        tileset: { key: "tiles", imagePath: "tiles.png" },
        playerSheet: { key: "player", imagePath: "player.png", frameWidth: 16, frameHeight: 16 },
        npcSheet: { key: "npc", imagePath: "npc.png", frameWidth: 16, frameHeight: 16 },
      },
      layerNames: ["Ground"],
      config,
    });

    let ambientPhase: string | null = null;
    let warningPhase: string | null = null;
    let dayNightUpdates = 0;
    let panicUpdates = 0;
    let policeUpdates = 0;
    let emitPhaseChange: ((event: { to: string }) => void) | null = null;
    let emitWarning: ((event: { to: string }) => void) | null = null;

    scene.create({
      makeTilemap: () => ({}),
      addTileset: () => ({}),
      createLayer: () => ({}),
      cameraFollow: () => {},
      player: {},
      controllers: {
        dayNight: {
          advance: () => {
            dayNightUpdates += 1;
          },
          onPhaseChange: (listener) => {
            emitPhaseChange = listener;
            return () => {
              emitPhaseChange = null;
            };
          },
          onPhaseWarning: (listener) => {
            emitWarning = listener;
            return () => {
              emitWarning = null;
            };
          },
        },
        panic: {
          advance: () => {
            panicUpdates += 1;
          },
        },
        police: {
          advance: () => {
            policeUpdates += 1;
          },
        },
      },
      onAmbientPhaseChange: (phase) => {
        ambientPhase = phase;
      },
      onPhaseWarning: (phase) => {
        warningPhase = phase;
      },
    });

    emitPhaseChange?.({ to: "night" });
    emitWarning?.({ to: "dusk" });
    scene.update(1, {
      makeTilemap: () => ({}),
      addTileset: () => ({}),
      createLayer: () => ({}),
      cameraFollow: () => {},
      player: {},
      controllers: {
        dayNight: { advance: () => { dayNightUpdates += 1; }, onPhaseChange: () => () => {}, onPhaseWarning: () => () => {} },
        panic: { advance: () => { panicUpdates += 1; } },
        police: { advance: () => { policeUpdates += 1; } },
      },
    });

    expect(ambientPhase).toBe("night");
    expect(warningPhase).toBe("dusk");
    expect(dayNightUpdates).toBe(1);
    expect(panicUpdates).toBe(1);
    expect(policeUpdates).toBe(1);

    scene.shutdown();
  });

  it("configures collision layer and collider when provided", () => {
    const config = ConfigSchema.parse({
      performance: { maxActiveNpcs: { town: 1 } },
    });
    const scene = new TownScene({
      assets: {
        tilemap: { key: "town", jsonPath: "town.json" },
        tileset: { key: "tiles", imagePath: "tiles.png" },
        playerSheet: { key: "player", imagePath: "player.png", frameWidth: 16, frameHeight: 16 },
        npcSheet: { key: "npc", imagePath: "npc.png", frameWidth: 16, frameHeight: 16 },
      },
      layerNames: ["Ground", "Obstacles"],
      config,
    });

    const physicsCalls: Array<string> = [];
    const player = {};
    scene.create({
      makeTilemap: () => ({}),
      addTileset: () => ({}),
      createLayer: (_map, layerName) => ({ name: layerName }),
      cameraFollow: () => {},
      player,
      physics: {
        setCollision: (layer, collides) => {
          physicsCalls.push(`set:${(layer as { name?: string }).name}:${collides}`);
        },
        addCollider: (a, b) => {
          physicsCalls.push(
            `collider:${a === player}:${(b as { name?: string }).name}`,
          );
        },
      },
      collisionLayerName: "Obstacles",
    });

    expect(physicsCalls).toEqual([
      "set:Obstacles:true",
      "collider:true:Obstacles",
    ]);
  });

  it("updates debug overlay state when enabled", () => {
    const config = ConfigSchema.parse({
      performance: { maxActiveNpcs: { town: 1 } },
    });
    const scene = new TownScene({
      assets: {
        tilemap: { key: "town", jsonPath: "town.json" },
        tileset: { key: "tiles", imagePath: "tiles.png" },
        playerSheet: { key: "player", imagePath: "player.png", frameWidth: 16, frameHeight: 16 },
        npcSheet: { key: "npc", imagePath: "npc.png", frameWidth: 16, frameHeight: 16 },
      },
      layerNames: ["Ground"],
      config,
    });

    const overlayStates: Array<{ phase: string | null; panicBubbleCount: number; policeCount: number }> = [];
    scene.update(1, {
      makeTilemap: () => ({}),
      addTileset: () => ({}),
      createLayer: () => ({}),
      cameraFollow: () => {},
      player: {},
      controllers: {
        dayNight: { advance: () => {}, onPhaseChange: () => () => {}, onPhaseWarning: () => () => {} },
        panic: { advance: () => {} },
        police: { advance: () => {} },
      },
      debug: {
        enabled: true,
        overlayUpdate: (state) => overlayStates.push({ ...state }),
        getPoliceCount: () => 3,
        getPanicBubbleCount: () => 2,
        getPhase: () => "night",
      },
    });

    expect(overlayStates).toEqual([
      { phase: "night", panicBubbleCount: 2, policeCount: 3 },
    ]);
  });
});
