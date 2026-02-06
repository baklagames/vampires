import type { GameConfig } from "../config/schema";

export type PoliceChaseMode = "patrol" | "chase" | "search";

export type PoliceChaseState = {
  mode: PoliceChaseMode;
  target: { x: number; y: number } | null;
  speed: number;
  lastSeenAtMs: number | null;
};

export class PoliceChaseController {
  private readonly config: Readonly<GameConfig>;
  private state: PoliceChaseState;

  constructor(config: Readonly<GameConfig>) {
    this.config = config;
    this.state = {
      mode: "patrol",
      target: null,
      speed: this.config.police.behavior.patrolSpeed,
      lastSeenAtMs: null,
    };
  }

  getState(): PoliceChaseState {
    return { ...this.state, target: this.state.target ? { ...this.state.target } : null };
  }

  spotTarget(position: { x: number; y: number }, nowMs: number): PoliceChaseState {
    this.state = {
      mode: "chase",
      target: { ...position },
      speed: this.config.police.behavior.chaseSpeed,
      lastSeenAtMs: nowMs,
    };
    return this.getState();
  }

  loseTarget(nowMs: number): PoliceChaseState {
    this.state = {
      mode: "search",
      target: this.state.target ? { ...this.state.target } : null,
      speed: this.config.police.behavior.patrolSpeed,
      lastSeenAtMs: nowMs,
    };
    return this.getState();
  }

  updateTarget(position: { x: number; y: number }, nowMs: number): PoliceChaseState {
    if (this.state.mode !== "chase") {
      return this.getState();
    }
    this.state.target = { ...position };
    this.state.lastSeenAtMs = nowMs;
    return this.getState();
  }

  advance(nowMs: number): PoliceChaseState {
    if (this.state.mode !== "search" || this.state.lastSeenAtMs === null) {
      return this.getState();
    }

    const elapsedSeconds = (nowMs - this.state.lastSeenAtMs) / 1000;
    if (elapsedSeconds >= this.config.police.behavior.searchDurationSeconds) {
      this.state = {
        mode: "patrol",
        target: null,
        speed: this.config.police.behavior.patrolSpeed,
        lastSeenAtMs: null,
      };
    }

    return this.getState();
  }
}
