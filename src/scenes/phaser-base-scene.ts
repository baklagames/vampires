import Phaser from "phaser";

import type { GameConfig } from "../config/schema";

export type SceneAssets = {
  tileset: { key: string; imagePath: string };
  playerSprite: { key: string; imagePath: string; frameWidth: number; frameHeight: number };
  npcSprite: { key: string; imagePath: string; frameWidth: number; frameHeight: number };
  policeSprite: { key: string; imagePath: string; frameWidth: number; frameHeight: number };
};

export type TilemapEntry = { id: string; path: string };

export abstract class PhaserBaseScene extends Phaser.Scene {
  protected readonly config: Readonly<GameConfig>;

  protected constructor(key: string, config: Readonly<GameConfig>) {
    super(key);
    this.config = config;
  }

  protected loadBaseAssets(assets: SceneAssets): void {
    this.load.image(assets.tileset.key, assets.tileset.imagePath);
    this.load.spritesheet(assets.playerSprite.key, assets.playerSprite.imagePath, {
      frameWidth: assets.playerSprite.frameWidth,
      frameHeight: assets.playerSprite.frameHeight,
    });
    this.load.spritesheet(assets.npcSprite.key, assets.npcSprite.imagePath, {
      frameWidth: assets.npcSprite.frameWidth,
      frameHeight: assets.npcSprite.frameHeight,
    });
    this.load.spritesheet(assets.policeSprite.key, assets.policeSprite.imagePath, {
      frameWidth: assets.policeSprite.frameWidth,
      frameHeight: assets.policeSprite.frameHeight,
    });
  }

  protected loadTilemap(entry: TilemapEntry): void {
    this.load.tilemapTiledJSON(entry.id, entry.path);
  }

  protected resolveTownTilemap(index = 0): TilemapEntry {
    const map = this.config.maps.town.tilemaps[index];
    if (!map) {
      throw new Error("No town tilemaps configured.");
    }
    return { id: map.id, path: map.path };
  }

  protected resolveInteriorTilemap(index = 0): TilemapEntry {
    const map = this.config.maps.interior.tilemaps[index];
    if (!map) {
      throw new Error("No interior tilemaps configured.");
    }
    return { id: map.id, path: map.path };
  }

  protected resolveCastleTilemap(): TilemapEntry {
    const map = this.config.maps.castle.tilemap;
    return { id: map.id, path: map.path };
  }

  protected resolveAssets(): SceneAssets {
    return {
      tileset: {
        key: this.config.maps.assets.tileset.key,
        imagePath: this.config.maps.assets.tileset.imagePath,
      },
      playerSprite: {
        key: this.config.maps.assets.playerSprite.key,
        imagePath: this.config.maps.assets.playerSprite.imagePath,
        frameWidth: this.config.maps.assets.playerSprite.frameWidth,
        frameHeight: this.config.maps.assets.playerSprite.frameHeight,
      },
      npcSprite: {
        key: this.config.maps.assets.npcSprite.key,
        imagePath: this.config.maps.assets.npcSprite.imagePath,
        frameWidth: this.config.maps.assets.npcSprite.frameWidth,
        frameHeight: this.config.maps.assets.npcSprite.frameHeight,
      },
      policeSprite: {
        key: this.config.maps.assets.policeSprite.key,
        imagePath: this.config.maps.assets.policeSprite.imagePath,
        frameWidth: this.config.maps.assets.policeSprite.frameWidth,
        frameHeight: this.config.maps.assets.policeSprite.frameHeight,
      },
    };
  }
}
