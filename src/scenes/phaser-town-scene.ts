import Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import { DayNightController } from "../controllers/day-night";
import { PanicBubbleController } from "../controllers/panic-bubble";
import { CoreSystemsHarness, type CoreSystemsSnapshot } from "../systems/core-systems-harness";
import { createGridFromMatrix } from "../systems/pathfinding";
import { createWorldGrid, type WorldGrid } from "../systems/world-grid";
import { OverlayManager } from "../ui/overlays/OverlayManager";
import { NpcManager, type NpcSpawnPoint } from "../entities/npc-manager";
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
  private worldGrid: WorldGrid | null = null;
  private pathfindingGrid: ReturnType<typeof createGridFromMatrix> | null = null;
  private overlayManager: OverlayManager;
  private overlayGraphics: Phaser.GameObjects.Graphics | null = null;
  private hudContainer: Phaser.GameObjects.Container | null = null;
  private actionButtons: Phaser.GameObjects.Rectangle[] = [];
  private targetPosition: { x: number; y: number } | null = null;
  private coreSystems: CoreSystemsHarness;
  private coreSnapshot: CoreSystemsSnapshot | null = null;
  private sunMap: { width: number; height: number; isSafe: (x: number, y: number) => boolean } | null = null;
  private npcManager: NpcManager | null = null;

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
    this.overlayManager = new OverlayManager(config);
    this.coreSystems = new CoreSystemsHarness(config);
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
    this.buildWorldGrid();
    this.setupOverlays();
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
    this.advanceCoreSystems(delta);
    this.updateHud();
    this.updateOverlays(delta);
  }

  private setupInput(): void {
    if (!this.config.controls.tapToMove.enabled) {
      return;
    }

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isPointerOnHud(pointer)) {
        return;
      }
      const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      this.moveTarget = new Phaser.Math.Vector2(worldPoint.x, worldPoint.y);
      this.targetPosition = { x: worldPoint.x, y: worldPoint.y };
      this.overlayManager.tapMarker.trigger(
        worldPoint.x,
        worldPoint.y,
        this.config.controls.targetRing.flashMs,
      );
      this.overlayManager.targetRing.attach("tap-target");
      this.overlayManager.targetRing.flash();
      this.overlayManager.targetOutline.attach("tap-target");
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

    this.hudContainer = this.add.container(0, 0).setDepth(1001);
    this.buildActionButtons();
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

    const snapshot = this.coreSnapshot;
    const phase = this.adapters.dayNight.getPhase();
    const phaseElapsed = this.adapters.dayNight.getPhaseElapsedSeconds();
    const phaseTimeLabel = formatSecondsMMSS(phaseElapsed);
    const health = snapshot?.player.health ?? this.config.player.stats.maxHealth;
    const blood = snapshot?.player.blood ?? this.config.player.stats.maxBlood;
    const heatMax = snapshot?.heat.levels ?? this.config.heat.levels;
    const heat = snapshot?.heat.heat ?? 0;

    this.hudText.setText([
      `Phase: ${phase.toUpperCase()} ${phaseTimeLabel}`,
      `HP ${health}/${this.config.player.stats.maxHealth}  Blood ${blood}/${this.config.player.stats.maxBlood}`,
      `Heat ${heat}/${heatMax}`,
    ]);
  }

  private buildWorldGrid(): void {
    const mapData = this.cache.tilemap.get(this.resolveTownTilemap(this.mapIndex).id)?.data;
    if (!mapData) {
      return;
    }
    this.worldGrid = createWorldGrid(mapData, {
      walkableLayers: ["Ground", "Roads", "Parks"],
      blockedLayers: ["Buildings", "Obstacles", "Trees"],
      losBlockedLayers: ["Buildings", "Obstacles", "Trees"],
      sunSafeLayers: ["Shadow"],
      sunSafeLayerProps: ["shadow", "safeZone"],
    });
    this.pathfindingGrid = createGridFromMatrix(this.worldGrid.walkableMask);
    this.sunMap = {
      width: this.worldGrid.width,
      height: this.worldGrid.height,
      isSafe: (x, y) => this.worldGrid?.isSunSafe(x, y) ?? false,
    };

    const spawnPoints = this.extractNpcSpawnPoints(mapData);
    this.npcManager = new NpcManager(
      this,
      this.config,
      this.worldGrid,
      this.resolveAssets().npcSprite.key,
      spawnPoints,
    );
    this.npcManager.ensurePopulation(this.adapters.dayNight.getNpcDensityMultiplier());
  }

  private setupOverlays(): void {
    this.overlayGraphics = this.add.graphics().setDepth(900);
  }

  private updateOverlays(deltaMs: number): void {
    if (!this.overlayGraphics) {
      return;
    }

    this.overlayManager.advance(deltaMs);
    const g = this.overlayGraphics;
    g.clear();

    const ring = this.overlayManager.targetRing.getState();
    const outline = this.overlayManager.targetOutline.getState();
    if (this.targetPosition && ring.visible) {
      const alpha = ring.flashRemainingMs > 0
        ? Math.min(1, ring.flashRemainingMs / this.config.controls.targetRing.flashMs)
        : 0.25;
      g.lineStyle(TOKENS.spacing.xs, TOKENS.colors.accent, alpha);
      g.strokeCircle(this.targetPosition.x, this.targetPosition.y, TOKENS.spacing.xl);
    }
    if (this.targetPosition && outline.visible) {
      g.lineStyle(TOKENS.spacing.xs, TOKENS.colors.textSecondary, 0.4);
      g.strokeCircle(this.targetPosition.x, this.targetPosition.y, TOKENS.spacing.lg);
    }

    const tap = this.overlayManager.tapMarker.getState();
    if (tap.visible) {
      g.lineStyle(TOKENS.spacing.xs, TOKENS.colors.accent, 0.6);
      g.strokeCircle(tap.x, tap.y, tap.radius);
    }

    const panic = this.adapters.panic.getBubbles()[0];
    if (panic) {
      this.overlayManager.panicArea.show(panic.x, panic.y, panic.radius);
    } else {
      this.overlayManager.panicArea.hide();
    }
    const panicState = this.overlayManager.panicArea.getState();
    if (panicState.visible) {
      g.lineStyle(TOKENS.spacing.xs, panicState.color, 0.35);
      g.strokeCircle(panicState.x, panicState.y, panicState.radius);
    }

    const sunState = this.overlayManager.sunDanger.getState();
    if (sunState.visible) {
      g.fillStyle(Phaser.Display.Color.HexStringToColor(sunState.color).color, sunState.intensity * 0.25);
      g.fillRect(0, 0, this.scale.width, this.scale.height);
    }
  }

  private buildActionButtons(): void {
    if (!this.hudContainer) {
      return;
    }
    const width = this.scale.width;
    const buttonHeight = TOKENS.spacing.xl + TOKENS.spacing.sm;
    const buttonWidth = (width - TOKENS.spacing.lg * 2 - TOKENS.spacing.sm * 2) / 3;
    const y = this.scale.height - buttonHeight - TOKENS.spacing.lg;
    const labels = ["Bite", "Escape", "Hide"];
    const surfaceColor = Phaser.Display.Color.HexStringToColor(TOKENS.colors.surface).color;
    const accentColor = Phaser.Display.Color.HexStringToColor(TOKENS.colors.accent).color;
    this.actionButtons = labels.map((label, index) => {
      const x = TOKENS.spacing.lg + index * (buttonWidth + TOKENS.spacing.sm) + buttonWidth / 2;
      const rect = this.add.rectangle(x, y + buttonHeight / 2, buttonWidth, buttonHeight, surfaceColor, 0.9);
      rect.setStrokeStyle(1, accentColor, 1);
      rect.setInteractive({ useHandCursor: true });
      rect.on("pointerdown", () => this.handleAction(label));
      const text = this.add.text(x, y + buttonHeight / 2, label, {
        fontFamily: "sans-serif",
        fontSize: `${TOKENS.typography.sm}px`,
        color: TOKENS.colors.textPrimary,
      }).setOrigin(0.5);
      this.hudContainer?.add([rect, text]);
      return rect;
    });
  }

  private handleAction(action: string): void {
    const nowMs = this.time.now;
    switch (action) {
      case "Bite": {
        this.coreSystems.startFeeding(nowMs, "tap-target");
        this.adapters.panic.addBubble(
          this.playerSprite?.x ?? 0,
          this.playerSprite?.y ?? 0,
          this.config.panic.bubble.radiusTiles,
          this.config.panic.bubble.durationSeconds,
        );
        break;
      }
      case "Escape":
      case "Hide":
      default:
        break;
    }
  }

  private advanceCoreSystems(deltaMs: number): void {
    if (!this.playerSprite || !this.worldGrid || !this.sunMap) {
      return;
    }
    const nowMs = this.time.now;
    const tilePos = this.worldGrid.worldToTile(this.playerSprite.x, this.playerSprite.y);
    const { snapshot } = this.coreSystems.advance(nowMs, deltaMs, {
      position: tilePos,
      sunMap: this.sunMap,
      phase: this.adapters.dayNight.getPhase(),
      inPanic: this.adapters.panic.getBubbleCount() > 0,
      inChase: false,
    });
    this.coreSnapshot = snapshot;
    if (snapshot.sun.inSun) {
      this.overlayManager.sunDanger.show(0.8);
    } else {
      this.overlayManager.sunDanger.hide();
    }
  }

  private isPointerOnHud(pointer: Phaser.Input.Pointer): boolean {
    const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    return this.actionButtons.some((button) => button.getBounds().contains(worldPoint.x, worldPoint.y));
  }

  private extractNpcSpawnPoints(mapData: { layers?: Array<{ name?: string; type?: string; objects?: Array<{ name?: string; x?: number; y?: number }> }> }): NpcSpawnPoint[] {
    const layer = mapData.layers?.find((entry) => entry.name === "Spawns" && entry.type === "objectgroup");
    if (!layer?.objects) {
      return [];
    }
    return layer.objects
      .filter((obj) => obj.name === "npc_spawn")
      .map((obj) => ({ x: obj.x ?? 0, y: obj.y ?? 0 }));
  }
}
