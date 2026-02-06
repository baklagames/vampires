import { TOKENS } from "../tokens";

export type TapMarkerState = {
  x: number;
  y: number;
  visible: boolean;
  radius: number;
  color: string;
  remainingMs: number;
};

export class TapMarker {
  private state: TapMarkerState = {
    x: 0,
    y: 0,
    visible: false,
    radius: TOKENS.spacing.md,
    color: TOKENS.colors.accent,
    remainingMs: 0,
  };

  getState(): TapMarkerState {
    return { ...this.state };
  }

  trigger(x: number, y: number, durationMs: number): void {
    this.state = {
      ...this.state,
      x,
      y,
      visible: true,
      remainingMs: Math.max(0, durationMs),
    };
  }

  advance(deltaMs: number): void {
    if (!this.state.visible || deltaMs <= 0) {
      return;
    }

    const remaining = this.state.remainingMs - deltaMs;
    if (remaining <= 0) {
      this.state = { ...this.state, visible: false, remainingMs: 0 };
    } else {
      this.state = { ...this.state, remainingMs: remaining };
    }
  }
}
