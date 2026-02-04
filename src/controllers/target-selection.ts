import type { GameConfig } from "../config/schema";

export type TargetableEntity = {
  id: string;
  x: number;
  y: number;
};

export type TargetSelectionResult = {
  selectedId: string | null;
  action: "move" | "select" | "clear";
};

export class TargetSelectionController {
  private readonly config: Readonly<GameConfig>;
  private selectedId: string | null = null;

  constructor(config: Readonly<GameConfig>) {
    this.config = config;
  }

  getSelectedId(): string | null {
    return this.selectedId;
  }

  clearSelection(): void {
    this.selectedId = null;
  }

  handleTap(
    tapTargetId: string | null,
  ): TargetSelectionResult {
    if (!this.config.controls.tapToTarget.enabled) {
      return {
        selectedId: this.selectedId,
        action: "move",
      };
    }

    if (!tapTargetId) {
      this.selectedId = null;
      return {
        selectedId: this.selectedId,
        action: "clear",
      };
    }

    if (this.selectedId === tapTargetId) {
      return {
        selectedId: this.selectedId,
        action: "select",
      };
    }

    this.selectedId = tapTargetId;
    return {
      selectedId: this.selectedId,
      action: "select",
    };
  }
}
