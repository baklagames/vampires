import type { GameConfig } from "../config/schema";
import {
  createManhattanHeuristic,
  findPath,
  type GridPoint,
  type PathfindingGrid,
} from "../systems/pathfinding";

export type TapToMoveResult = {
  path: GridPoint[];
  speed: number;
};

export type TapToMoveOptions = {
  allowDiagonal?: boolean;
  movementCost?: {
    straight: number;
    diagonal?: number;
  };
};

export class TapToMoveController {
  private readonly config: Readonly<GameConfig>;
  private readonly grid: PathfindingGrid;
  private readonly allowDiagonal: boolean;
  private readonly movementCost: TapToMoveOptions["movementCost"];

  constructor(
    config: Readonly<GameConfig>,
    grid: PathfindingGrid,
    options: TapToMoveOptions = {},
  ) {
    this.config = config;
    this.grid = grid;
    this.allowDiagonal = options.allowDiagonal ?? false;
    this.movementCost = options.movementCost ?? { straight: 1 };
  }

  handleTap(current: GridPoint, target: GridPoint): TapToMoveResult | null {
    if (!this.config.controls.tapToMove.enabled) {
      return null;
    }

    const heuristic = createManhattanHeuristic(this.movementCost.straight);
    const path = findPath(this.grid, current, target, {
      allowDiagonal: this.allowDiagonal,
      movementCost: this.movementCost,
      heuristic,
    });

    if (!path) {
      return null;
    }

    return {
      path,
      speed: this.config.humans.base.walkSpeed,
    };
  }
}
