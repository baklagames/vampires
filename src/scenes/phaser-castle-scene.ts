import Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import { CastleScene } from "./castle";
import { PhaserBaseScene } from "./phaser-base-scene";

export class PhaserCastleScene extends PhaserBaseScene {
  private readonly logic: CastleScene;

  constructor(config: Readonly<GameConfig>) {
    super("castle", config);
    const assets = this.resolveAssets();
    const map = this.resolveCastleTilemap();
    this.logic = new CastleScene({
      tilemapKey: map.id,
      tilemapPath: map.path,
      tilesetKey: assets.tileset.key,
      tilesetPath: assets.tileset.imagePath,
    });
  }

  preload(): void {
    const assets = this.resolveAssets();
    const map = this.resolveCastleTilemap();
    this.loadBaseAssets(assets);
    this.loadTilemap(map);
  }

  create(): void {
    this.logic.create({
      loadTilemap: () => {},
      loadTileset: () => {},
      makeTilemap: (key) => this.make.tilemap({ key }),
      addTileset: (map, tilesetKey) => map.addTilesetImage(tilesetKey),
      createLayer: (map, layerName, tileset) => map.createLayer(layerName, tileset),
      setupCollision: () => {},
      onExit: () => {},
    });
  }
}
