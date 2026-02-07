export type TiledLayerProperty = {
  name: string;
  type: string;
  value: unknown;
};

export type TiledTileLayer = {
  name: string;
  type: "tilelayer";
  width: number;
  height: number;
  data?: number[];
  properties?: TiledLayerProperty[];
};

export type TiledLayer = TiledTileLayer | { name: string; type: string };

export type TiledMap = {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
};

export type WorldGrid = {
  width: number;
  height: number;
  tileSize: number;
  walkableMask: boolean[][];
  losBlockedMask: boolean[][];
  sunSafeMask: boolean[][];
  worldToTile: (x: number, y: number) => { x: number; y: number };
  tileToWorld: (x: number, y: number) => { x: number; y: number };
  isWalkable: (x: number, y: number) => boolean;
  isLineBlocked: (x: number, y: number) => boolean;
  isSunSafe: (x: number, y: number) => boolean;
};

export type WorldGridOptions = {
  walkableLayers?: string[];
  blockedLayers?: string[];
  losBlockedLayers?: string[];
  sunSafeLayers?: string[];
  sunSafeLayerProps?: string[];
};

const DEFAULT_OPTIONS: Required<WorldGridOptions> = {
  walkableLayers: ["Ground", "Roads", "Parks"],
  blockedLayers: ["Buildings", "Obstacles", "Trees"],
  losBlockedLayers: ["Buildings", "Obstacles", "Trees"],
  sunSafeLayers: ["Shadow"],
  sunSafeLayerProps: ["shadow", "safeZone"],
};

export const createWorldGrid = (
  map: TiledMap,
  options: WorldGridOptions = {},
): WorldGrid => {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const width = map.width;
  const height = map.height;
  const tileSize = Math.max(map.tilewidth, map.tileheight);

  const walkable = buildMaskFromLayers(map, merged.walkableLayers, merged.sunSafeLayerProps);
  const blocked = buildMaskFromLayers(map, merged.blockedLayers, merged.sunSafeLayerProps);
  const losBlocked = buildMaskFromLayers(map, merged.losBlockedLayers, merged.sunSafeLayerProps);
  const sunSafe = buildMaskFromLayers(map, merged.sunSafeLayers, merged.sunSafeLayerProps, true);

  const walkableMask = subtractMask(walkable, blocked);
  const losBlockedMask = cloneMask(losBlocked);
  const sunSafeMask = cloneMask(sunSafe);

  return {
    width,
    height,
    tileSize,
    walkableMask,
    losBlockedMask,
    sunSafeMask,
    worldToTile: (x, y) => ({
      x: Math.floor(x / tileSize),
      y: Math.floor(y / tileSize),
    }),
    tileToWorld: (x, y) => ({
      x: x * tileSize + tileSize / 2,
      y: y * tileSize + tileSize / 2,
    }),
    isWalkable: (x, y) => Boolean(walkableMask[y]?.[x]),
    isLineBlocked: (x, y) => Boolean(losBlockedMask[y]?.[x]),
    isSunSafe: (x, y) => Boolean(sunSafeMask[y]?.[x]),
  };
};

const buildMaskFromLayers = (
  map: TiledMap,
  layerNames: string[],
  propNames: string[],
  includePropertyMatches = false,
): boolean[][] => {
  const mask = createMask(map.width, map.height);

  for (const layer of map.layers) {
    if (layer.type !== "tilelayer") {
      continue;
    }

    const layerMatches = layerNames.includes(layer.name);
    const propMatches = includePropertyMatches && hasAnyProperty(layer.properties, propNames);
    if (!layerMatches && !propMatches) {
      continue;
    }

    const data = layer.data ?? [];
    for (let y = 0; y < map.height; y += 1) {
      for (let x = 0; x < map.width; x += 1) {
        const index = y * map.width + x;
        if (data[index] && data[index] > 0) {
          mask[y][x] = true;
        }
      }
    }
  }

  return mask;
};

const createMask = (width: number, height: number): boolean[][] =>
  Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false),
  );

const cloneMask = (mask: boolean[][]): boolean[][] =>
  mask.map((row) => row.slice());

const subtractMask = (base: boolean[][], remove: boolean[][]): boolean[][] =>
  base.map((row, y) => row.map((value, x) => value && !remove[y]?.[x]));

const hasAnyProperty = (
  properties: TiledLayerProperty[] | undefined,
  propNames: string[],
): boolean => {
  if (!properties) {
    return false;
  }
  return properties.some((prop) => propNames.includes(prop.name) && Boolean(prop.value));
};
