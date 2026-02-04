export type TileProperties = Record<string, unknown>;

export type TileCell = {
  properties?: TileProperties;
};

export type TilemapLayer = {
  name?: string;
  properties?: TileProperties;
  tiles: (TileCell | null)[][];
};

export type TilemapDescriptor = {
  width: number;
  height: number;
  layers: TilemapLayer[];
};

export type SunShadeMap = {
  width: number;
  height: number;
  isSafe: (x: number, y: number) => boolean;
  toMask: () => boolean[][];
};

export type DayPhase = "day" | "dusk" | "night" | "dawn";

export type DynamicSunShadeMap = SunShadeMap & {
  setPhase: (phase: DayPhase) => void;
  getPhase: () => DayPhase;
};

type SunShadeOptions = {
  safeZoneKeys?: string[];
  initialPhase?: DayPhase;
};

const DEFAULT_SAFE_ZONE_KEYS = ["interior", "shadow", "safeZone"];

export const createSunShadeMap = (
  tilemap: TilemapDescriptor,
  options: SunShadeOptions = {},
): SunShadeMap => {
  const safeZoneKeys = options.safeZoneKeys ?? DEFAULT_SAFE_ZONE_KEYS;
  const mask = buildBaseMask(tilemap, safeZoneKeys);

  return {
    width: tilemap.width,
    height: tilemap.height,
    isSafe: (x, y) => {
      if (x < 0 || y < 0 || y >= tilemap.height || x >= tilemap.width) {
        return false;
      }

      return Boolean(mask[y]?.[x]);
    },
    toMask: () => mask.map((row) => row.slice()),
  };
};

export const createDynamicSunShadeMap = (
  tilemap: TilemapDescriptor,
  options: SunShadeOptions = {},
): DynamicSunShadeMap => {
  const safeZoneKeys = options.safeZoneKeys ?? DEFAULT_SAFE_ZONE_KEYS;
  const baseMask = buildBaseMask(tilemap, safeZoneKeys);
  const dayMask = cloneMask(baseMask);
  const nightMask = buildNightMask(baseMask);
  let currentMask = dayMask;
  let phase: DayPhase = options.initialPhase ?? "day";

  const applyPhase = () => {
    currentMask = phase === "night" ? nightMask : dayMask;
  };

  applyPhase();

  return {
    width: tilemap.width,
    height: tilemap.height,
    isSafe: (x, y) => {
      if (x < 0 || y < 0 || y >= tilemap.height || x >= tilemap.width) {
        return false;
      }

      return Boolean(currentMask[y]?.[x]);
    },
    toMask: () => cloneMask(currentMask),
    setPhase: (nextPhase) => {
      phase = nextPhase;
      applyPhase();
    },
    getPhase: () => phase,
  };
};

const createMask = (width: number, height: number): boolean[][] =>
  Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false),
  );

const cloneMask = (mask: boolean[][]): boolean[][] =>
  mask.map((row) => row.slice());

const buildBaseMask = (
  tilemap: TilemapDescriptor,
  safeZoneKeys: string[],
): boolean[][] => {
  const mask = createMask(tilemap.width, tilemap.height);

  for (const layer of tilemap.layers) {
    const layerIsSafe = hasAnyBooleanProperty(layer.properties, safeZoneKeys);
    const tiles = layer.tiles;

    for (let y = 0; y < tilemap.height; y += 1) {
      const row = tiles[y];
      if (!row) {
        continue;
      }

      for (let x = 0; x < tilemap.width; x += 1) {
        const cell = row[x];
        if (!cell) {
          continue;
        }

        const cellIsSafe =
          layerIsSafe ||
          hasAnyBooleanProperty(cell.properties, safeZoneKeys);
        if (cellIsSafe) {
          mask[y][x] = true;
        }
      }
    }
  }

  return mask;
};

const buildNightMask = (baseMask: boolean[][]): boolean[][] =>
  baseMask.map((row) => row.map(() => true));

const hasAnyBooleanProperty = (
  properties: TileProperties | undefined,
  keys: string[],
): boolean => {
  if (!properties) {
    return false;
  }

  return keys.some((key) => Boolean(properties[key]));
};
