import Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import { BiteActionController } from "../controllers/bite-action";
import { DayNightController } from "../controllers/day-night";
import { PanicBubbleController } from "../controllers/panic-bubble";
import { PanicPropagationController } from "../controllers/panic-propagation";
import { PoliceSpawner } from "../controllers/police-spawner";
import { TapToMoveController } from "../controllers/tap-to-move";
import { TargetSelectionController } from "../controllers/target-selection";
import { CoreSystemsHarness, type CoreSystemsSnapshot } from "../systems/core-systems-harness";
import { createGridFromMatrix } from "../systems/pathfinding";
import { createWorldGrid, type WorldGrid } from "../systems/world-grid";
import { OverlayManager } from "../ui/overlays/OverlayManager";
import { NpcManager, type NpcSpawnPoint } from "../entities/npc-manager";
import { PoliceManager } from "../entities/police-manager";
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
  private districtGraphics: Phaser.GameObjects.Graphics | null = null;
  private hudContainer: Phaser.GameObjects.Container | null = null;
  private actionButtons: Phaser.GameObjects.Rectangle[] = [];
  private targetPosition: { x: number; y: number } | null = null;
  private coreSystems: CoreSystemsHarness;
  private coreSnapshot: CoreSystemsSnapshot | null = null;
  private sunMap: { width: number; height: number; isSafe: (x: number, y: number) => boolean } | null = null;
  private npcManager: NpcManager | null = null;
  private policeManager: PoliceManager | null = null;
  private policeSpawner: PoliceSpawner;
  private panicPropagation: PanicPropagationController;
  private phaseUnsubscribe: (() => void) | null = null;
  private warningUnsubscribe: (() => void) | null = null;
  private tapController: TapToMoveController | null = null;
  private readonly targetSelection: TargetSelectionController;
  private readonly biteAction: BiteActionController;
  private movePath: Phaser.Math.Vector2[] = [];
  private selectedNpcId: string | null = null;
  private policeSpawnPoints: Array<{ x: number; y: number }> = [];
  private playerIndicator: Phaser.GameObjects.Graphics | null = null;

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
    this.policeSpawner = new PoliceSpawner(config);
    this.panicPropagation = new PanicPropagationController(config);
    this.targetSelection = new TargetSelectionController(config);
    this.biteAction = new BiteActionController(config);
  }

  preload(): void {
    const assets = this.resolveAssets();
    const map = this.resolveTownTilemap(this.mapIndex);
    this.loadBaseAssets(assets);
    this.loadTilemap(map);
  }

  create(): void {
    const player = this.physics.add.sprite(0, 0, this.resolveAssets().playerSprite.key);
    player.setScale(1.5);
    player.setDepth(80);
    player.setTint(0xff3b3b);
    player.setAlpha(1);
    player.setFrame(4);
    this.playerSprite = player;
    const mapFactory = (key: string) => this.make.tilemap({ key });
    const tilesetFactory = (map: Phaser.Tilemaps.Tilemap, tilesetKey: string) =>
      map.addTilesetImage(map.tilesets[0]?.name ?? tilesetKey, tilesetKey);
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

    for (const layer of this.logic.getLayers()) {
      const tileLayer = layer as Phaser.Tilemaps.TilemapLayer;
      tileLayer.setAlpha(0);
    }

    const map = this.logic.getMap() as Phaser.Tilemaps.Tilemap | null;
    if (map) {
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    }

    this.buildWorldGrid();
    this.positionPlayerOnSafeTile();
    this.spawnNpcsNearPlayer();
    this.spawnPoliceNearPlayer();
    this.setupInput();
    this.setupHud();
    this.setupOverlays();
    this.events.once("shutdown", () => {
      this.phaseUnsubscribe?.();
      this.warningUnsubscribe?.();
      this.phaseUnsubscribe = null;
      this.warningUnsubscribe = null;
    });
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
    this.updatePolice(delta);
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
      const tileSize = this.config.maps.town.tileSize;
      const selectionRadiusPx = this.config.controls.tapToTarget.radiusTiles * tileSize;
      const nearest = this.npcManager?.findNearest(worldPoint, selectionRadiusPx) ?? null;
      const selection = this.targetSelection.handleTap(nearest?.getId() ?? null);

      if (selection.action === "select" && nearest) {
        this.selectedNpcId = nearest.getId();
        const pos = nearest.getPosition();
        this.setMoveTarget(pos.x, pos.y);
        this.targetPosition = { ...pos };
        this.overlayManager.targetRing.attach(this.selectedNpcId);
        this.overlayManager.targetRing.flash();
        this.overlayManager.targetOutline.attach(this.selectedNpcId);
        this.tryStartBite(nearest);
        return;
      }

      this.selectedNpcId = null;
      this.biteAction.stop();
      this.setMoveTarget(worldPoint.x, worldPoint.y);
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
    this.hudContainer.setScrollFactor(0);
    this.buildActionButtons();
  }

  private updateMovement(deltaSeconds: number): void {
    if (!this.playerSprite) {
      return;
    }

    this.updateTargetTracking();

    if (!this.moveTarget && this.movePath.length > 0) {
      this.moveTarget = this.movePath.shift() ?? null;
    }

    if (!this.moveTarget) {
      return;
    }

    const tileSize = this.config.maps.town.tileSize;
    const speedPixelsPerSecond = this.config.player.stats.moveSpeed * tileSize;
    const arrivalThreshold = this.config.controls.tapToMove.arrivalThresholdTiles * tileSize;

    const dx = this.moveTarget.x - this.playerSprite.x;
    const dy = this.moveTarget.y - this.playerSprite.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= arrivalThreshold) {
      if (this.movePath.length > 0) {
        this.moveTarget = this.movePath.shift() ?? null;
      } else {
        this.moveTarget = null;
      }
      return;
    }

    const step = Math.min(distance, speedPixelsPerSecond * deltaSeconds);
    const ratio = step / distance;
    this.playerSprite.setPosition(
      this.playerSprite.x + dx * ratio,
      this.playerSprite.y + dy * ratio,
    );
    this.tryStartBiteBySelection();
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
    this.tapController = new TapToMoveController(this.config, this.pathfindingGrid);
    this.renderDistrictBackdrop(mapData);
    this.sunMap = {
      width: this.worldGrid.width,
      height: this.worldGrid.height,
      isSafe: (x, y) => this.worldGrid?.isSunSafe(x, y) ?? false,
    };

    const spawnPoints = this.extractNpcSpawnPoints(mapData);
    this.policeSpawnPoints = this.extractPoliceSpawnPoints(mapData);
    this.npcManager = new NpcManager(
      this,
      this.config,
      this.worldGrid,
      this.resolveAssets().npcSprite.key,
      spawnPoints,
    );
    this.npcManager.ensurePopulation(this.adapters.dayNight.getNpcDensityMultiplier());
    this.npcManager.setPhaseSpeedMultiplier(this.getNpcSpeedMultiplier());
    this.registerPanicTargets();

    this.policeManager = new PoliceManager(
      this,
      this.config,
      this.worldGrid,
      this.resolveAssets().policeSprite.key,
    );
    this.spawnInitialPolice();

    this.phaseUnsubscribe = this.adapters.dayNight.onPhaseChange(() => {
      this.npcManager?.ensurePopulation(this.adapters.dayNight.getNpcDensityMultiplier());
      this.npcManager?.setPhaseSpeedMultiplier(this.getNpcSpeedMultiplier());
    });
    this.warningUnsubscribe = this.adapters.dayNight.onPhaseWarning(() => {
      this.overlayManager.flash.trigger("sun");
    });
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

    const flash = this.overlayManager.flash.getState();
    if (flash.alpha > 0 && flash.color) {
      g.fillStyle(Phaser.Display.Color.HexStringToColor(flash.color).color, flash.alpha);
      g.fillRect(0, 0, this.scale.width, this.scale.height);
    }

    this.updatePlayerIndicator();
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
      rect.setScrollFactor(0);
      rect.setInteractive({ useHandCursor: true });
      rect.on("pointerdown", () => this.handleAction(label));
      const text = this.add.text(x, y + buttonHeight / 2, label, {
        fontFamily: "sans-serif",
        fontSize: `${TOKENS.typography.sm}px`,
        color: TOKENS.colors.textPrimary,
      }).setOrigin(0.5);
      text.setScrollFactor(0);
      this.hudContainer?.add([rect, text]);
      return rect;
    });
  }

  private handleAction(action: string): void {
    const nowMs = this.time.now;
    switch (action) {
      case "Bite": {
        this.tryStartBiteBySelection();
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
    const { snapshot, feedingEvent } = this.coreSystems.advance(nowMs, deltaMs, {
      position: tilePos,
      sunMap: this.sunMap,
      phase: this.adapters.dayNight.getPhase(),
      inPanic: this.adapters.panic.getBubbleCount() > 0,
      inChase: false,
    });
    this.coreSnapshot = snapshot;
    if (feedingEvent?.type === "completed" || feedingEvent?.type === "interrupted") {
      this.biteAction.stop();
    }
    if (snapshot.sun.inSun) {
      this.overlayManager.sunDanger.show(0.8);
    } else {
      this.overlayManager.sunDanger.hide();
    }
  }

  private isPointerOnHud(pointer: Phaser.Input.Pointer): boolean {
    return this.actionButtons.some((button) => button.getBounds().contains(pointer.x, pointer.y));
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

  private extractPoliceSpawnPoints(mapData: { layers?: Array<{ name?: string; type?: string; objects?: Array<{ name?: string; x?: number; y?: number }> }> }): Array<{ x: number; y: number }> {
    const layer = mapData.layers?.find((entry) => entry.name === "Spawns" && entry.type === "objectgroup");
    if (!layer?.objects) {
      return [];
    }
    return layer.objects
      .filter((obj) => obj.name === "police_spawn")
      .map((obj) => ({ x: obj.x ?? 0, y: obj.y ?? 0 }));
  }

  private registerPanicTargets(): void {
    this.refreshPanicTargets();
  }

  private updatePolice(deltaMs: number): void {
    if (!this.worldGrid || !this.policeManager) {
      return;
    }

    const nowMs = this.time.now;
    this.npcManager?.update(nowMs, deltaMs);
    this.policeManager.update(nowMs, deltaMs);
    this.refreshPanicTargets();

    const bubbles = this.adapters.panic.getBubbles();
    this.panicPropagation.propagate(
      bubbles.map((bubble) => ({
        id: bubble.id,
        x: bubble.x,
        y: bubble.y,
        radius: bubble.radius,
      })),
    );

    const heatLevel = this.coreSnapshot?.heat.heat ?? 0;
    const phaseMultiplier = this.adapters.dayNight.getPhase() === "night"
      ? this.config.police.spawn.nightMultiplier
      : 1;

    if (bubbles.length > 0) {
      for (const bubble of bubbles) {
        const plan = this.policeSpawner.createSpawnPlan(
          bubble,
          heatLevel,
          phaseMultiplier,
          nowMs,
          (x, y) => {
            const tile = this.worldGrid?.worldToTile(x, y);
            return tile ? this.worldGrid?.isWalkable(tile.x, tile.y) : false;
          },
          Math.random,
        );

        if (plan.points.length > 0) {
          this.policeManager.spawn(plan.points);
        }
      }
    }

    this.policeManager.updateTarget(
      this.playerSprite ? { x: this.playerSprite.x, y: this.playerSprite.y } : null,
      nowMs,
    );
  }

  private getNpcSpeedMultiplier(): number {
    return this.adapters.dayNight.getPhase() === "night"
      ? this.config.dayNight.npcSpeed.nightMultiplier
      : this.config.dayNight.npcSpeed.dayMultiplier;
  }

  private setMoveTarget(worldX: number, worldY: number): void {
    if (!this.playerSprite || !this.worldGrid || !this.tapController) {
      this.movePath = [];
      this.moveTarget = new Phaser.Math.Vector2(worldX, worldY);
      return;
    }

    const current = this.worldGrid.worldToTile(this.playerSprite.x, this.playerSprite.y);
    const target = this.worldGrid.worldToTile(worldX, worldY);
    const route = this.tapController.handleTap(current, target);
    if (!route || route.path.length === 0) {
      this.movePath = [];
      this.moveTarget = new Phaser.Math.Vector2(worldX, worldY);
      return;
    }

    const points = route.path
      .slice(1)
      .map((step) => this.worldGrid?.tileToWorld(step.x, step.y))
      .filter((point): point is { x: number; y: number } => Boolean(point))
      .map((point) => new Phaser.Math.Vector2(point.x, point.y));

    this.movePath = points;
    this.moveTarget = this.movePath.shift() ?? new Phaser.Math.Vector2(worldX, worldY);
  }

  private updateTargetTracking(): void {
    if (!this.selectedNpcId || !this.npcManager) {
      return;
    }

    const target = this.npcManager.getActive().find((npc) => npc.getId() === this.selectedNpcId);
    if (!target) {
      this.selectedNpcId = null;
      this.targetSelection.clearSelection();
      this.moveTarget = null;
      this.movePath = [];
      this.targetPosition = null;
      return;
    }

    const pos = target.getPosition();
    this.movePath = [];
    this.moveTarget = new Phaser.Math.Vector2(pos.x, pos.y);
    this.targetPosition = { ...pos };
  }

  private tryStartBiteBySelection(): void {
    if (!this.selectedNpcId || !this.npcManager) {
      return;
    }
    const target = this.npcManager.getActive().find((npc) => npc.getId() === this.selectedNpcId);
    if (!target) {
      this.selectedNpcId = null;
      this.targetSelection.clearSelection();
      return;
    }
    this.tryStartBite(target);
  }

  private tryStartBite(npc: { getId: () => string; getPosition: () => { x: number; y: number } }): void {
    if (!this.playerSprite || !this.worldGrid) {
      return;
    }

    const playerTile = this.worldGrid.worldToTile(this.playerSprite.x, this.playerSprite.y);
    const npcPos = npc.getPosition();
    const npcTile = this.worldGrid.worldToTile(npcPos.x, npcPos.y);
    const biteResult = this.biteAction.tryBite(playerTile, npcTile);
    if (!biteResult.canBite) {
      return;
    }

    const nowMs = this.time.now;
    const started = this.coreSystems.startFeeding(nowMs, npc.getId());
    if (!started.accepted) {
      return;
    }

    this.coreSystems.recordHeatEvent("bite", nowMs);
    this.adapters.panic.addBubble(
      npcPos.x,
      npcPos.y,
      this.config.panic.bubble.radiusTiles,
      this.config.panic.bubble.durationSeconds,
    );
  }

  private refreshPanicTargets(): void {
    if (!this.npcManager) {
      return;
    }
    for (const npc of this.npcManager.getActive()) {
      this.panicPropagation.upsertTarget({
        id: npc.getId(),
        position: npc.getPosition(),
        panic: () => npc.panic(this.time.now),
      });
    }
  }

  private positionPlayerOnSafeTile(): void {
    if (!this.playerSprite || !this.worldGrid) {
      return;
    }
    const center = {
      x: Math.floor(this.worldGrid.width / 2),
      y: Math.floor(this.worldGrid.height / 2),
    };
    const spawn = this.findNearestTile(center.x, center.y, (x, y) => this.worldGrid?.isSunSafe(x, y) ?? false)
      ?? this.findNearestTile(center.x, center.y, (x, y) => this.worldGrid?.isWalkable(x, y) ?? false);
    if (!spawn) {
      return;
    }
    const world = this.worldGrid.tileToWorld(spawn.x, spawn.y);
    this.playerSprite.setPosition(world.x, world.y);
  }

  private findNearestTile(
    startX: number,
    startY: number,
    matcher: (x: number, y: number) => boolean,
  ): { x: number; y: number } | null {
    if (!this.worldGrid) {
      return null;
    }
    const maxRadius = Math.max(this.worldGrid.width, this.worldGrid.height);
    if (matcher(startX, startY)) {
      return { x: startX, y: startY };
    }
    for (let radius = 1; radius < maxRadius; radius += 1) {
      for (let y = startY - radius; y <= startY + radius; y += 1) {
        for (let x = startX - radius; x <= startX + radius; x += 1) {
          if (matcher(x, y)) {
            return { x, y };
          }
        }
      }
    }
    return null;
  }

  private spawnInitialPolice(): void {
    if (!this.policeManager) {
      return;
    }
    const baseCount = Math.max(0, this.config.police.spawn.baseCount);
    if (baseCount <= 0) {
      return;
    }
    const fallback = [
      { x: 48, y: 48 },
      { x: 464, y: 48 },
      { x: 48, y: 464 },
      { x: 464, y: 464 },
    ];
    const points = (this.policeSpawnPoints.length > 0 ? this.policeSpawnPoints : fallback)
      .slice(0, baseCount);
    this.policeManager.spawn(points);
  }

  private spawnNpcsNearPlayer(): void {
    if (!this.npcManager || !this.playerSprite || !this.worldGrid) {
      return;
    }
    const count = this.config.npc.spawn.nearPlayerCount;
    if (count <= 0) {
      return;
    }
    const radiusTiles = this.config.npc.spawn.nearPlayerRadiusTiles;
    const tilePos = this.worldGrid.worldToTile(this.playerSprite.x, this.playerSprite.y);
    const points: Array<{ x: number; y: number }> = [];
    const maxAttempts = Math.max(count * 8, 12);
    for (let i = 0; i < maxAttempts && points.length < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radiusTiles;
      const x = Math.round(tilePos.x + Math.cos(angle) * distance);
      const y = Math.round(tilePos.y + Math.sin(angle) * distance);
      if (!this.worldGrid.isWalkable(x, y)) {
        continue;
      }
      points.push(this.worldGrid.tileToWorld(x, y));
    }
    for (const point of points) {
      this.npcManager.spawnAt(point.x, point.y);
    }
  }

  private spawnPoliceNearPlayer(): void {
    if (!this.policeManager || !this.playerSprite || !this.worldGrid) {
      return;
    }
    const count = this.config.police.spawn.nearPlayerCount;
    if (count <= 0) {
      return;
    }
    const radiusTiles = this.config.police.spawn.nearPlayerRadiusTiles;
    const tilePos = this.worldGrid.worldToTile(this.playerSprite.x, this.playerSprite.y);
    const points: Array<{ x: number; y: number }> = [];
    const maxAttempts = Math.max(count * 8, 12);
    for (let i = 0; i < maxAttempts && points.length < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radiusTiles;
      const x = Math.round(tilePos.x + Math.cos(angle) * distance);
      const y = Math.round(tilePos.y + Math.sin(angle) * distance);
      if (!this.worldGrid.isWalkable(x, y)) {
        continue;
      }
      points.push(this.worldGrid.tileToWorld(x, y));
    }
    this.policeManager.spawn(points);
  }

  private updatePlayerIndicator(): void {
    if (!this.playerSprite) {
      return;
    }
    if (!this.playerIndicator) {
      this.playerIndicator = this.add.graphics().setDepth(950);
    }
    const indicator = this.playerIndicator;
    indicator.clear();
    indicator.fillStyle(0xff3b3b, 0.25);
    indicator.fillCircle(this.playerSprite.x, this.playerSprite.y, TOKENS.spacing.xl * 1.5);
    indicator.lineStyle(TOKENS.spacing.xs, 0xff3b3b, 0.9);
    indicator.strokeCircle(this.playerSprite.x, this.playerSprite.y, TOKENS.spacing.xl * 1.5);
  }

  private renderDistrictBackdrop(mapData: {
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    layers?: Array<{ name?: string; type?: string; data?: number[] }>;
  }): void {
    this.districtGraphics?.destroy();
    const g = this.add.graphics().setDepth(-50);
    this.districtGraphics = g;

    const width = mapData.width;
    const height = mapData.height;
    const tileW = mapData.tilewidth;
    const tileH = mapData.tileheight;
    const tileSize = this.config.maps.town.tileSize;

    const getLayer = (name: string): number[] => {
      const layer = mapData.layers?.find((entry) => entry.type === "tilelayer" && entry.name === name);
      return layer?.data ?? [];
    };

    const roads = getLayer("Roads");
    const parks = getLayer("Parks");
    const buildings = getLayer("Buildings");
    const trees = getLayer("Trees");
    const shadow = getLayer("Shadow");

    g.fillStyle(0x7f92b8, 1);
    g.fillRect(0, 0, width * tileW, height * tileH);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        const worldX = x * tileW;
        const worldY = y * tileH;

        if (roads[index] && roads[index] > 0) {
          g.fillStyle(0x5f6472, 1);
          g.fillRect(worldX, worldY, tileW, tileH);
          g.fillStyle(0xc7cad1, 0.15);
          g.fillRect(worldX, worldY + Math.floor(tileH / 2), tileW, 1);
        } else if (parks[index] && parks[index] > 0) {
          g.fillStyle(0x6f9f64, 1);
          g.fillRect(worldX, worldY, tileW, tileH);
        }

        if (buildings[index] && buildings[index] > 0) {
          g.fillStyle(0x3e3b32, 1);
          g.fillRect(worldX, worldY, tileW, tileH);
          g.fillStyle(0x4f4a3e, 1);
          g.fillRect(worldX, worldY, tileW, 3);
        }

        if (trees[index] && trees[index] > 0) {
          g.fillStyle(0x2b5f34, 1);
          g.fillCircle(
            worldX + Math.floor(tileSize / 2),
            worldY + Math.floor(tileSize / 2),
            Math.floor(tileSize * 0.35),
          );
          g.fillStyle(0x6f4a2b, 1);
          g.fillRect(worldX + 6, worldY + 8, 3, 6);
        }

        if (shadow[index] && shadow[index] > 0) {
          g.fillStyle(0x000000, 0.2);
          g.fillRect(worldX, worldY, tileW, tileH);
        }
      }
    }
  }
}
