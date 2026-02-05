import { TOKENS } from "../tokens";

export type FlashType = "panic" | "sun";

export type FlashOverlayState = {
  type: FlashType | null;
  alpha: number;
  color: string | null;
};

export type FlashOverlayOptions = {
  panicColor?: string;
  sunColor?: string;
  maxAlpha?: number;
  fadeMs?: number;
};

export class FlashOverlay {
  private readonly panicColor: string;
  private readonly sunColor: string;
  private readonly maxAlpha: number;
  private readonly fadeMs: number;
  private state: FlashOverlayState = {
    type: null,
    alpha: 0,
    color: null,
  };

  constructor(options: FlashOverlayOptions = {}) {
    this.panicColor = options.panicColor ?? TOKENS.colors.danger;
    this.sunColor = options.sunColor ?? TOKENS.colors.warning;
    this.maxAlpha = options.maxAlpha ?? 0.6;
    this.fadeMs = options.fadeMs ?? 300;
  }

  trigger(type: FlashType): void {
    this.state = {
      type,
      alpha: this.maxAlpha,
      color: type === "panic" ? this.panicColor : this.sunColor,
    };
  }

  advance(deltaMs: number): void {
    if (this.state.alpha <= 0 || deltaMs <= 0) {
      return;
    }

    const nextAlpha = this.state.alpha - (deltaMs / this.fadeMs) * this.maxAlpha;
    this.state.alpha = Math.max(0, nextAlpha);
    if (this.state.alpha === 0) {
      this.state.type = null;
      this.state.color = null;
    }
  }

  getState(): FlashOverlayState {
    return { ...this.state };
  }
}
