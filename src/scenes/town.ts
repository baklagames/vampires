export type TilemapAsset = {
  key: string;
  jsonPath: string;
};

export type TilesetAsset = {
  key: string;
  imagePath: string;
};

export type SpriteSheetAsset = {
  key: string;
  imagePath: string;
  frameWidth: number;
  frameHeight: number;
};

export type TownSceneAssets = {
  tilemap: TilemapAsset;
  tileset: TilesetAsset;
  playerSheet: SpriteSheetAsset;
  npcSheet: SpriteSheetAsset;
};

export type TownSceneLoader = {
  tilemapTiledJSON: (key: string, path: string) => void;
  image: (key: string, path: string) => void;
  spritesheet: (
    key: string,
    path: string,
    config: { frameWidth: number; frameHeight: number },
  ) => void;
};

export type TownSceneNpcSpawner = {
  dayNightController: { getNpcDensityMultiplier: () => number };
  npcPool: { spawnAt: (x: number, y: number) => void; getActiveCount: () => number };
  walkablePoints: () => Array<{ x: number; y: number }>;
};

export type TownSceneCreateContext = {
  makeTilemap: (key: string) => unknown;
  addTileset: (map: unknown, tilesetKey: string) => unknown;
  createLayer: (
    map: unknown,
    layerName: string,
    tileset: unknown,
  ) => unknown;
  cameraFollow: (target: unknown) => void;
  player: unknown;
  npcSpawn?: TownSceneNpcSpawner;
  controllers?: {
    dayNight: {
      advance: (deltaSeconds: number) => void;
      onPhaseChange: (listener: (event: { to: string }) => void) => () => void;
      onPhaseWarning: (listener: (event: { to: string }) => void) => () => void;
    };
    panic: {
      advance: (deltaSeconds: number) => void;
    };
    police: {
      advance: (deltaSeconds: number) => void;
    };
  };
  onAmbientPhaseChange?: (phase: string) => void;
  onPhaseWarning?: (phase: string) => void;
  physics?: {
    setCollision: (layer: unknown, collides: boolean) => void;
    addCollider: (a: unknown, b: unknown) => void;
  };
  collisionLayerName?: string;
  debug?: {
    enabled: boolean;
    overlayUpdate: (state: {
      phase: string | null;
      panicBubbleCount: number;
      policeCount: number;
    }) => void;
    getPoliceCount: () => number;
    getPanicBubbleCount: () => number;
    getPhase: () => string;
  };
};

export type TownSceneOptions = {
  assets: TownSceneAssets;
  layerNames: string[];
  config: Readonly<import("../config/schema").GameConfig>;
};

export class TownScene {
  private readonly assets: TownSceneAssets;
  private readonly layerNames: string[];
  private readonly config: Readonly<import("../config/schema").GameConfig>;
  private map: unknown;
  private layers: unknown[] = [];
  private controllerUnsubscribes: Array<() => void> = [];
  private debugState: {
    phase: string | null;
    panicBubbleCount: number;
    policeCount: number;
  } = {
    phase: null,
    panicBubbleCount: 0,
    policeCount: 0,
  };

  constructor(options: TownSceneOptions) {
    this.assets = options.assets;
    this.layerNames = options.layerNames;
    this.config = options.config;
  }

  preload(loader: TownSceneLoader): void {
    const { tilemap, tileset, playerSheet, npcSheet } = this.assets;

    loader.tilemapTiledJSON(tilemap.key, tilemap.jsonPath);
    loader.image(tileset.key, tileset.imagePath);
    loader.spritesheet(playerSheet.key, playerSheet.imagePath, {
      frameWidth: playerSheet.frameWidth,
      frameHeight: playerSheet.frameHeight,
    });
    loader.spritesheet(npcSheet.key, npcSheet.imagePath, {
      frameWidth: npcSheet.frameWidth,
      frameHeight: npcSheet.frameHeight,
    });
  }

  create(context: TownSceneCreateContext): void {
    this.map = context.makeTilemap(this.assets.tilemap.key);
    const tileset = context.addTileset(this.map, this.assets.tileset.key);

    this.layers = this.layerNames.map((layerName) =>
      context.createLayer(this.map, layerName, tileset),
    );

    context.cameraFollow(context.player);

    if (context.physics && context.collisionLayerName) {
      const collisionLayer = this.layers.find(
        (layer) => (layer as { name?: string }).name === context.collisionLayerName,
      );
      if (collisionLayer) {
        context.physics.setCollision(collisionLayer, true);
        context.physics.addCollider(context.player, collisionLayer);
      }
    }

    if (context.npcSpawn) {
      this.spawnNpcs(context.npcSpawn);
    }

    if (context.controllers) {
      const { dayNight } = context.controllers;
      this.controllerUnsubscribes.push(
        dayNight.onPhaseChange((event) => {
          this.debugState.phase = event.to;
          context.onAmbientPhaseChange?.(event.to);
        }),
        dayNight.onPhaseWarning((event) => {
          context.onPhaseWarning?.(event.to);
        }),
      );
    }
  }

  getMap(): unknown {
    return this.map;
  }

  getLayers(): unknown[] {
    return [...this.layers];
  }

  update(deltaSeconds: number, context?: TownSceneCreateContext): void {
    if (!context?.controllers) {
      return;
    }

    context.controllers.dayNight.advance(deltaSeconds);
    context.controllers.panic.advance(deltaSeconds);
    context.controllers.police.advance(deltaSeconds);

    if (context.debug?.enabled) {
      this.debugState.panicBubbleCount = context.debug.getPanicBubbleCount();
      this.debugState.policeCount = context.debug.getPoliceCount();
      this.debugState.phase = context.debug.getPhase();
      context.debug.overlayUpdate(this.debugState);
    }
  }

  shutdown(): void {
    for (const unsubscribe of this.controllerUnsubscribes) {
      unsubscribe();
    }
    this.controllerUnsubscribes = [];
  }

  private spawnNpcs(spawn: TownSceneNpcSpawner): void {
    const densityMultiplier = spawn.dayNightController.getNpcDensityMultiplier();
    const baseCount = this.config.performance.maxActiveNpcs.town;
    const desiredCount = Math.floor(baseCount * densityMultiplier);
    const available = spawn.walkablePoints();

    const spawnCount = Math.min(
      desiredCount,
      Math.max(0, available.length - spawn.npcPool.getActiveCount()),
    );

    for (let i = 0; i < spawnCount; i += 1) {
      const point = available[i];
      if (!point) {
        break;
      }
      spawn.npcPool.spawnAt(point.x, point.y);
    }
  }
}
