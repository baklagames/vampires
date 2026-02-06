import { TOKENS } from "../tokens";

export type PanicAreaIndicatorState = {
  x: number;
  y: number;
  radius: number;
  color: string;
  visible: boolean;
};

export class PanicAreaIndicator {
  private state: PanicAreaIndicatorState = {
    x: 0,
    y: 0,
    radius: 0,
    color: TOKENS.colors.warning,
    visible: false,
  };

  getState(): PanicAreaIndicatorState {
    return { ...this.state };
  }

  show(x: number, y: number, radius: number): void {
    this.state = {
      ...this.state,
      x,
      y,
      radius,
      visible: true,
    };
  }

  hide(): void {
    this.state = { ...this.state, visible: false };
  }
}
