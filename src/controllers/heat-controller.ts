import type { GameConfig } from "../config/schema";

export type HeatState = {
  heat: number;
  levels: number;
  percent: number;
  isDecaying: boolean;
};

export type HeatEventType =
  | "bite"
  | "kill"
  | "witness"
  | "panic"
  | "chase";

export class HeatController {
  private readonly config: Readonly<GameConfig>;
  private heat: number;
  private lastIncreaseAtMs: number | null = null;

  constructor(config: Readonly<GameConfig>) {
    this.config = config;
    this.heat = 0;
  }

  getState(): HeatState {
    const levels = Math.max(1, this.config.heat.levels);
    const clamped = clamp(this.heat, 0, levels);
    const percent = clamped / levels;
    const isDecaying = this.config.heat.decay.enabled && this.lastIncreaseAtMs !== null;

    return {
      heat: clamped,
      levels,
      percent,
      isDecaying,
    };
  }

  addHeat(type: HeatEventType, nowMs: number): HeatState {
    return this.addHeatAmount(this.getIncreaseAmount(type), nowMs);
  }

  addHeatAmount(amount: number, nowMs: number): HeatState {
    if (amount <= 0) {
      return this.getState();
    }

    this.heat += amount;
    this.lastIncreaseAtMs = nowMs;
    return this.getState();
  }

  advance(deltaSeconds: number, nowMs: number): HeatState {
    if (!this.config.heat.decay.enabled) {
      return this.getState();
    }

    if (this.lastIncreaseAtMs === null) {
      return this.getState();
    }

    const elapsedSinceIncrease = Math.max(0, nowMs - this.lastIncreaseAtMs);
    const decayDelayMs = this.config.heat.decay.secondsToStartDecay * 1000;
    if (elapsedSinceIncrease < decayDelayMs || deltaSeconds <= 0) {
      return this.getState();
    }

    this.heat = Math.max(0, this.heat - this.config.heat.decay.decayPerSecond * deltaSeconds);
    return this.getState();
  }

  private getIncreaseAmount(type: HeatEventType): number {
    switch (type) {
      case "bite":
        return this.config.heat.increase.onBite;
      case "kill":
        return this.config.heat.increase.onKill;
      case "witness":
        return this.config.heat.increase.onWitnessCall;
      case "panic":
        return this.config.heat.increase.perSecondInPanic;
      case "chase":
        return this.config.heat.increase.perSecondInChase;
    }
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
