import type { GameConfig } from "../config/schema";
import { SpatialHash } from "../systems/spatial-hash";

export type PanicTarget = {
  id: string;
  position: { x: number; y: number };
  panic: () => void;
};

export type PanicBubbleSnapshot = {
  id: string;
  x: number;
  y: number;
  radius: number;
};

export class PanicPropagationController {
  private readonly config: Readonly<GameConfig>;
  private readonly spatial: SpatialHash;
  private readonly targets = new Map<string, PanicTarget>();

  constructor(config: Readonly<GameConfig>, options?: { cellSize?: number }) {
    this.config = config;
    const cellSize = options?.cellSize ?? this.config.panic.bubble.radiusTiles;
    this.spatial = new SpatialHash(Math.max(1, cellSize));
  }

  upsertTarget(target: PanicTarget): void {
    this.targets.set(target.id, target);
    this.spatial.upsert({ id: target.id, position: target.position });
  }

  removeTarget(id: string): void {
    this.targets.delete(id);
    this.spatial.remove(id);
  }

  propagate(bubbles: PanicBubbleSnapshot[]): string[] {
    if (!this.config.panic.witness.panicSpreadWithinBubble) {
      return [];
    }

    const affected = new Set<string>();

    for (const bubble of bubbles) {
      const nearby = this.spatial.queryRadius(
        { x: bubble.x, y: bubble.y },
        bubble.radius,
      );

      for (const entry of nearby) {
        if (affected.has(entry.id)) {
          continue;
        }
        const target = this.targets.get(entry.id);
        if (!target) {
          continue;
        }
        target.panic();
        affected.add(entry.id);
      }
    }

    return Array.from(affected);
  }
}
