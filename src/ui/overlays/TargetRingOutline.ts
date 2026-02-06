import { TOKENS } from "../tokens";

export type TargetRingOutlineState = {
  visible: boolean;
  targetId: string | null;
  color: string;
  thickness: number;
};

export class TargetRingOutline {
  private state: TargetRingOutlineState = {
    visible: false,
    targetId: null,
    color: TOKENS.colors.accent,
    thickness: TOKENS.spacing.xs,
  };

  getState(): TargetRingOutlineState {
    return { ...this.state };
  }

  attach(targetId: string): void {
    this.state = { ...this.state, visible: true, targetId };
  }

  detach(): void {
    this.state = { ...this.state, visible: false, targetId: null };
  }
}
