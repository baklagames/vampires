import { TOKENS } from "../tokens";

export type SunDangerOverlayState = {
  visible: boolean;
  intensity: number;
  color: string;
};

export class SunDangerOverlay {
  private state: SunDangerOverlayState = {
    visible: false,
    intensity: 0,
    color: TOKENS.colors.warning,
  };

  getState(): SunDangerOverlayState {
    return { ...this.state };
  }

  show(intensity: number): void {
    this.state = {
      ...this.state,
      visible: true,
      intensity: clamp(intensity, 0, 1),
    };
  }

  hide(): void {
    this.state = { ...this.state, visible: false, intensity: 0 };
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
