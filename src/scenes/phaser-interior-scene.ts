import Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import { InteriorScene } from "./interior";
import { PhaserBaseScene } from "./phaser-base-scene";

export class PhaserInteriorScene extends PhaserBaseScene {
  private readonly logic: InteriorScene;
  private mapIndex: number;

  constructor(config: Readonly<GameConfig>, mapIndex = 0) {
    super("interior", config);
    this.mapIndex = mapIndex;
    const assets = this.resolveAssets();
    const map = this.resolveInteriorTilemap(mapIndex);
    this.logic = new InteriorScene({
      tilemapKey: map.id,
      tilemapPath: map.path,
      tilesetKey: assets.tileset.key,
      tilesetPath: assets.tileset.imagePath,
    });
  }

  preload(): void {
    const assets = this.resolveAssets();
    const map = this.resolveInteriorTilemap(this.mapIndex);
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
