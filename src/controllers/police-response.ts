import type { GameConfig } from "../config/schema";

export type PanicBubbleLocation = {
  x: number;
  y: number;
  radius: number;
};

export type WalkableChecker = (x: number, y: number) => boolean;

export type PoliceSpawnPoint = {
  x: number;
  y: number;
};

export type SpawnOptions = {
  count: number;
  radiusJitterFraction: number;
  maxAttempts: number;
  random: () => number;
};

export class PoliceResponseController {
  private readonly policeConfig: Readonly<GameConfig["police"]>;

  constructor(config: Readonly<GameConfig>) {
    this.policeConfig = config.police;
  }

  getBaseSpawnCount(): number {
    return this.policeConfig.spawn.baseCount;
  }

  getResponseCountPerHeat(): number {
    return this.policeConfig.spawn.responseCountPerHeat;
  }

  getSpawnCount(
    baseCount: number,
    heatLevel: number,
    phaseMultiplier: number,
  ): number {
    const normalizedHeat = Math.max(0, Math.floor(heatLevel));
    const total =
      baseCount + normalizedHeat * this.policeConfig.spawn.responseCountPerHeat;
    return Math.round(total * phaseMultiplier);
  }

  getNightSpawnMultiplier(): number {
    return this.policeConfig.spawn.nightMultiplier;
  }

  selectSpawnPoints(
    bubble: PanicBubbleLocation,
    isWalkable: WalkableChecker,
    options: SpawnOptions,
  ): PoliceSpawnPoint[] {
    const points: PoliceSpawnPoint[] = [];
    const maxDistance = Math.max(0, bubble.radius * options.radiusJitterFraction);

    let attempts = 0;
    while (points.length < options.count && attempts < options.maxAttempts) {
      attempts += 1;
      const angle = options.random() * Math.PI * 2;
      const distance = options.random() * maxDistance;
      const x = bubble.x + Math.cos(angle) * distance;
      const y = bubble.y + Math.sin(angle) * distance;

      if (!isWalkable(x, y)) {
        continue;
      }

      points.push({ x, y });
    }

    return points;
  }
}
