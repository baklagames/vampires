import Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import { DayNightController } from "../controllers/day-night";
import { PanicBubbleController } from "../controllers/panic-bubble";
import { formatSecondsMMSS } from "../ui/format-time";
import { TOKENS } from "../ui/tokens";
import { TownScene } from "./town";
import { PhaserBaseScene } from "./phaser-base-scene";

type SceneAdapters = {
  dayNight: DayNightController;
  panic: PanicBubbleController;
  police: { advance: (deltaSeconds: number) => void };
};

export class PhaserTownScene extends PhaserBaseScene {
  private readonly logic: TownScene;
  private readonly adapters: SceneAdapters;
  private mapIndex: number;
  private playerSprite: Phaser.GameObjects.Sprite | null = null;
  private moveTarget: Phaser.Math.Vector2 | null = null;
  private hudText: Phaser.GameObjects.Text | null = null;

  constructor(config: Readonly<GameConfig>, mapIndex = 0) {
    super("town", config);
    this.mapIndex = mapIndex;
    const assets = this.resolveAssets();
    const map = this.resolveTownTilemap(mapIndex);
    this.logic = new TownScene({
      assets: {
        tilemap: { key: map.id, jsonPath: map.path },
        tileset: { key: assets.tileset.key, imagePath: assets.tileset.imagePath },
        playerSheet: {
          key: assets.playerSprite.key,
          imagePath: assets.playerSprite.imagePath,
          frameWidth: assets.playerSprite.frameWidth,
          frameHeight: assets.playerSprite.frameHeight,
        },
        npcSheet: {
          key: assets.npcSprite.key,
          imagePath: assets.npcSprite.imagePath,
          frameWidth: assets.npcSprite.frameWidth,
          frameHeight: assets.npcSprite.frameHeight,
        },
      },
      layerNames: ["Ground", "Roads", "Parks", "Buildings", "Trees", "Obstacles", "Shadow"],
      config,
    });

    this.adapters = {
      dayNight: new DayNightController(config),
      panic: new PanicBubbleController(),
      police: { advance: () => {} },
    };
  }

  preload(): void {
    const assets = this.resolveAssets();
    const map = this.resolveTownTilemap(this.mapIndex);
    this.loadBaseAssets(assets);
    this.loadTilemap(map);
  }

  create(): void {
    const player = this.physics.add.sprite(0, 0, this.resolveAssets().playerSprite.key);
    this.playerSprite = player;
    const mapFactory = (key: string) => this.make.tilemap({ key });
    const tilesetFactory = (map: Phaser.Tilemaps.Tilemap, tilesetKey: string) =>
      map.addTilesetImage(tilesetKey);
    const layerFactory = (
      map: Phaser.Tilemaps.Tilemap,
      layerName: string,
      tileset: Phaser.Tilemaps.Tileset | null,
    ) => map.createLayer(layerName, tileset);

    this.logic.create({
      makeTilemap: mapFactory,
      addTileset: tilesetFactory,
      createLayer: layerFactory,
      cameraFollow: (target) => {
        this.cameras.main.startFollow(target as Phaser.GameObjects.Sprite);
      },
      player,
      controllers: {
        dayNight: this.adapters.dayNight,
        panic: this.adapters.panic,
        police: this.adapters.police,
      },
      physics: {
        setCollision: (layer, collides) => {
          if (!collides) {
            return;
          }
          const tileLayer = layer as Phaser.Tilemaps.TilemapLayer;
          tileLayer.setCollisionByExclusion([-1]);
        },
        addCollider: (a, b) => {
          this.physics.add.collider(a as Phaser.GameObjects.GameObject, b as Phaser.GameObjects.GameObject);
        },
      },
      collisionLayerName: "Obstacles",
    });

    this.setupInput();
    this.setupHud();
  }

  update(_time: number, delta: number): void {
    const deltaSeconds = delta / 1000;
    this.logic.update(deltaSeconds, {
      controllers: {
        dayNight: this.adapters.dayNight,
        panic: this.adapters.panic,
        police: this.adapters.police,
      },
    });
    this.updateMovement(deltaSeconds);
    this.updateHud();
  }

  private setupInput(): void {
    if (!this.config.controls.tapToMove.enabled) {
      return;
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      this.moveTarget = new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);
    });
  }

  private setupHud(): void {
    const padding = TOKENS.spacing.sm;
    this.hudText = this.add
      .text(padding, padding, "", {
        fontFamily: "sans-serif",
        fontSize: `${TOKENS.typography.sm}px`,
        color: TOKENS.colors.textPrimary,
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }

  private updateMovement(deltaSeconds: number): void {
    if (!this.playerSprite || !this.moveTarget) {
      return;
    }

    const tileSize = this.config.maps.town.tileSize;
    const speedPixelsPerSecond = this.config.player.stats.moveSpeed * tileSize;
    const arrivalThreshold = this.config.controls.tapToMove.arrivalThresholdTiles * tileSize;

    const dx = this.moveTarget.x - this.playerSprite.x;
    const dy = this.moveTarget.y - this.playerSprite.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= arrivalThreshold) {
      this.moveTarget = null;
      return;
    }

    const step = Math.min(distance, speedPixelsPerSecond * deltaSeconds);
    const ratio = step / distance;
    this.playerSprite.setPosition(
      this.playerSprite.x + dx * ratio,
      this.playerSprite.y + dy * ratio,
    );
  }

  private updateHud(): void {
    if (!this.hudText) {
      return;
    }

    const phase = this.adapters.dayNight.getPhase();
    const phaseElapsed = this.adapters.dayNight.getPhaseElapsedSeconds();
    const phaseTimeLabel = formatSecondsMMSS(phaseElapsed);
    const health = this.config.player.stats.maxHealth;
    const blood = this.config.player.stats.maxBlood;
    const heatMax = this.config.heat.levels;

    this.hudText.setText([
      `Phase: ${phase.toUpperCase()} ${phaseTimeLabel}`,
      `HP ${health}/${health}  Blood ${blood}/${blood}`,
      `Heat 0/${heatMax}`,
    ]);
  }
}
