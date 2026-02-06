import type { GameConfig } from "../config/schema";
import type { SunShadeMap } from "./sun-shade-map";

export type SunDamageState = {
  enabled: boolean;
  inSun: boolean;
  graceRemainingMs: number;
};

export class SunDamageSystem {
  private readonly config: Readonly<GameConfig>;
  private graceRemainingMs: number;

  constructor(config: Readonly<GameConfig>) {
    this.config = config;
    this.graceRemainingMs = this.config.sun.graceMs;
  }

  getState(inSun: boolean): SunDamageState {
    return {
      enabled: this.config.sun.enabled,
      inSun,
      graceRemainingMs: this.graceRemainingMs,
    };
  }

  resetGrace(): void {
    this.graceRemainingMs = this.config.sun.graceMs;
  }

  apply(
    deltaMs: number,
    position: { x: number; y: number },
    map: SunShadeMap,
    phase: "day" | "dusk" | "night" | "dawn",
  ): { damage: number; inSun: boolean } {
    if (!this.config.sun.enabled) {
      return { damage: 0, inSun: false };
    }

    const isSafe = map.isSafe(position.x, position.y);
    const sunActive = phase === "day" || phase === "dusk";
    const inSun = sunActive && !isSafe;

    if (!inSun || deltaMs <= 0) {
      if (!inSun) {
        this.resetGrace();
      }
      return { damage: 0, inSun };
    }

    let remainingMs = deltaMs;
    if (this.graceRemainingMs > 0) {
      const usedGrace = Math.min(this.graceRemainingMs, remainingMs);
      this.graceRemainingMs = Math.max(0, this.graceRemainingMs - usedGrace);
      remainingMs -= usedGrace;
    }

    if (remainingMs <= 0) {
      return { damage: 0, inSun };
    }

    const damage = (remainingMs / 1000) * this.config.sun.damagePerSecond;
    return { damage, inSun };
  }
}
