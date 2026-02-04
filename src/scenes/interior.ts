export type InteriorSceneAssets = {
  tilemapKey: string;
  tilemapPath: string;
  tilesetKey: string;
  tilesetPath: string;
};

export type InteriorSceneContext = {
  loadTilemap: (key: string, path: string) => void;
  loadTileset: (key: string, path: string) => void;
  makeTilemap: (key: string) => unknown;
  addTileset: (map: unknown, tilesetKey: string) => unknown;
  createLayer: (map: unknown, layerName: string, tileset: unknown) => unknown;
  setupCollision: (layer: unknown) => void;
  onExit: () => void;
};

export class InteriorScene {
  private readonly assets: InteriorSceneAssets;

  constructor(assets: InteriorSceneAssets) {
    this.assets = assets;
  }

  preload(context: InteriorSceneContext): void {
    context.loadTilemap(this.assets.tilemapKey, this.assets.tilemapPath);
    context.loadTileset(this.assets.tilesetKey, this.assets.tilesetPath);
  }

  create(context: InteriorSceneContext): void {
    const map = context.makeTilemap(this.assets.tilemapKey);
    const tileset = context.addTileset(map, this.assets.tilesetKey);
    const collisionLayer = context.createLayer(map, "Obstacles", tileset);
    context.setupCollision(collisionLayer);
  }

  triggerExit(context: InteriorSceneContext): void {
    context.onExit();
  }
}
