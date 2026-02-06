import type { GameConfig } from "../config/schema";
import type { LineOfSightGrid } from "../systems/line-of-sight";
import { hasLineOfSight } from "../systems/line-of-sight";

export type DetectionInput = {
  npc: { x: number; y: number; facing: { x: number; y: number } };
  player: { x: number; y: number };
};

export type DetectionState = {
  awareness: number;
  inVisionCone: boolean;
  hasLineOfSight: boolean;
  distance: number;
  angleDegrees: number;
};

export class DetectionController {
  private readonly config: Readonly<GameConfig>;
  private awareness = 0;

  constructor(config: Readonly<GameConfig>) {
    this.config = config;
  }

  getState(): DetectionState {
    return {
      awareness: this.awareness,
      inVisionCone: false,
      hasLineOfSight: false,
      distance: 0,
      angleDegrees: 0,
    };
  }

  advance(
    input: DetectionInput,
    deltaSeconds: number,
    grid: LineOfSightGrid,
  ): DetectionState {
    const dx = input.player.x - input.npc.x;
    const dy = input.player.y - input.npc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRange = this.config.npc.detection.visionRangeTiles;

    let inVisionCone = false;
    let angleDegrees = 180;

    if (distance > 0) {
      const dir = normalize(dx, dy);
      const facing = normalize(input.npc.facing.x, input.npc.facing.y);
      const dot = clamp(dir.x * facing.x + dir.y * facing.y, -1, 1);
      angleDegrees = Math.acos(dot) * (180 / Math.PI);
      inVisionCone = angleDegrees <= this.config.npc.detection.visionConeDegrees / 2;
    }

    const inRange = distance <= maxRange;
    const los = inRange && inVisionCone
      ? hasLineOfSight(grid, input.npc, input.player).clear
      : false;

    if (inRange && inVisionCone && los) {
      const gain = deltaSeconds / this.config.npc.detection.suspicionSeconds;
      this.awareness = clamp(this.awareness + gain, 0, 1);
    } else {
      const decay = deltaSeconds / this.config.npc.detection.alarmDurationSeconds;
      this.awareness = clamp(this.awareness - decay, 0, 1);
    }

    return {
      awareness: this.awareness,
      inVisionCone,
      hasLineOfSight: los,
      distance,
      angleDegrees,
    };
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalize = (x: number, y: number): { x: number; y: number } => {
  const length = Math.sqrt(x * x + y * y);
  if (length <= 0) {
    return { x: 1, y: 0 };
  }
  return { x: x / length, y: y / length };
};
