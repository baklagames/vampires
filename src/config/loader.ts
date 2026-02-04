import yaml from "js-yaml";

import { formatZodError } from "./errors";
import { ConfigSchema, type GameConfig } from "./schema";

const deepFreeze = <T>(value: T): T => {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);

  for (const key of Object.getOwnPropertyNames(value)) {
    const prop = (value as Record<string, unknown>)[key];
    deepFreeze(prop);
  }

  return value;
};

export const loadConfig = async (
  path: string,
): Promise<Readonly<GameConfig>> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
  }

  const raw = await response.text();
  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown YAML parsing error.";
    throw new Error(`Failed to parse config YAML: ${message}`);
  }

  const validated = ConfigSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(formatZodError(validated.error));
  }

  const defaults = ConfigSchema.parse(buildDefaultConfigInput());
  const merged = mergeDefaults(defaults, validated.data);

  return deepFreeze(merged);
};

const buildDefaultConfigInput = (): Record<string, unknown> => ({
  game: {},
  player: {
    name: {
      random: {},
      manualInput: {},
    },
  },
  controls: {
    tapToMove: {},
    tapToTarget: {},
    targetRing: {},
    tapMarker: {},
  },
  dayNight: {
    cycle: {},
    npcDensity: {},
  },
  sun: {
    safeZones: {},
  },
  panic: {
    bubble: {},
    witness: {},
  },
  heat: {
    decay: {},
  },
  humans: {
    base: {},
    variants: {
      adultMale: {},
      adultFemale: {},
      kid: {},
      grandma: {},
      grandpa: {},
    },
  },
  police: {
    spawn: {},
    vision: {},
    damage: {},
  },
  feeding: {
    bite: {},
    reward: {},
  },
  performance: {
    maxActiveNpcs: {},
  },
});

const mergeDefaults = <T>(defaults: T, override: T): T => {
  if (Array.isArray(defaults) || Array.isArray(override)) {
    return override;
  }

  if (!isPlainObject(defaults) || !isPlainObject(override)) {
    return override;
  }

  const result: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = (defaults as Record<string, unknown>)[key];
    result[key] = mergeDefaults(baseValue, value);
  }

  return result as T;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
