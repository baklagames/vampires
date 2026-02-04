import type { GameConfig } from "../config/schema";

export type TargetRingState = {
  visible: boolean;
  targetId: string | null;
  flashRemainingMs: number;
};

export class TargetRingFlash {
  private readonly flashMs: number;
  private state: TargetRingState = {
    visible: false,
    targetId: null,
    flashRemainingMs: 0,
  };

  constructor(config: Readonly<GameConfig>) {
    this.flashMs = config.controls.targetRing.flashMs;
  }

  getState(): TargetRingState {
    return { ...this.state };
  }

  attach(targetId: string): void {
    this.state = {
      visible: true,
      targetId,
      flashRemainingMs: 0,
    };
  }

  detach(): void {
    this.state = {
      visible: false,
      targetId: null,
      flashRemainingMs: 0,
    };
  }

  flash(): void {
    if (!this.state.targetId) {
      return;
    }

    this.state.flashRemainingMs = this.flashMs;
    this.state.visible = true;
  }

  advance(deltaMs: number): void {
    if (deltaMs <= 0 || this.state.flashRemainingMs <= 0) {
      return;
    }

    this.state.flashRemainingMs = Math.max(
      0,
      this.state.flashRemainingMs - deltaMs,
    );
  }
}
