import Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import { DayNightController } from "../controllers/day-night";
import { PanicBubbleController } from "../controllers/panic-bubble";
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
      layerNames: ["Ground", "Obstacles"],
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
    const player = this.add.sprite(0, 0, this.resolveAssets().playerSprite.key);
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
  }
}
