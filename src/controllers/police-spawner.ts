import type { GameConfig } from "../config/schema";
import type { PanicBubbleLocation, WalkableChecker, PoliceSpawnPoint } from "./police-response";
import { PoliceResponseController } from "./police-response";

export type PoliceSpawnPlan = {
  count: number;
  points: PoliceSpawnPoint[];
  nextAllowedAtMs: number;
};

export class PoliceSpawner {
  private readonly config: Readonly<GameConfig>;
  private readonly response: PoliceResponseController;
  private nextAllowedAtMs = 0;

  constructor(config: Readonly<GameConfig>) {
    this.config = config;
    this.response = new PoliceResponseController(config);
  }

  getNextAllowedAt(): number {
    return this.nextAllowedAtMs;
  }

  createSpawnPlan(
    bubble: PanicBubbleLocation,
    heatLevel: number,
    phaseMultiplier: number,
    nowMs: number,
    isWalkable: WalkableChecker,
    random: () => number,
  ): PoliceSpawnPlan {
    if (nowMs < this.nextAllowedAtMs) {
      return { count: 0, points: [], nextAllowedAtMs: this.nextAllowedAtMs };
    }

    const baseCount = this.response.getBaseSpawnCount();
    const count = this.response.getSpawnCount(baseCount, heatLevel, phaseMultiplier);
    const points = this.response.selectSpawnPoints(bubble, isWalkable, {
      count,
      radiusJitterFraction: this.config.police.behavior.spawnRadiusJitterFraction,
      maxAttempts: this.config.police.behavior.spawnMaxAttempts,
      random,
    });

    this.nextAllowedAtMs =
      nowMs + this.config.police.behavior.responseDelaySeconds * 1000;

    return {
      count,
      points,
      nextAllowedAtMs: this.nextAllowedAtMs,
    };
  }
}
