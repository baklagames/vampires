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

  return deepFreeze(validated.data);
};
