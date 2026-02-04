import type { GameConfig } from "../config/schema";

export type BiteState = "idle" | "feeding";

export type BiteActionResult = {
  state: BiteState;
  canBite: boolean;
};

export class BiteActionController {
  private readonly config: Readonly<GameConfig>;
  private state: BiteState = "idle";

  constructor(config: Readonly<GameConfig>) {
    this.config = config;
  }

  getState(): BiteState {
    return this.state;
  }

  tryBite(
    player: { x: number; y: number },
    target: { x: number; y: number } | null,
  ): BiteActionResult {
    if (!target) {
      this.state = "idle";
      return { state: this.state, canBite: false };
    }

    const dx = player.x - target.x;
    const dy = player.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const canBite = distance <= this.config.feeding.bite.rangeTiles;

    if (canBite) {
      this.state = "feeding";
    }

    return { state: this.state, canBite };
  }

  stop(): void {
    this.state = "idle";
  }
}
