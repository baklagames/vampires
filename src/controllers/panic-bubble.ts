export type PanicBubble = {
  id: string;
  x: number;
  y: number;
  radius: number;
  remainingSeconds: number;
};

export type PanicBubbleSnapshot = {
  id: string;
  x: number;
  y: number;
  radius: number;
  remainingSeconds: number;
};

export type PanicTarget = {
  id: string;
  x: number;
  y: number;
  panic: () => void;
};

export class PanicBubbleController {
  private readonly bubbles = new Map<string, PanicBubble>();
  private nextId = 1;

  addBubble(x: number, y: number, radius: number, durationSeconds: number): string {
    const id = `bubble-${this.nextId}`;
    this.nextId += 1;

    this.bubbles.set(id, {
      id,
      x,
      y,
      radius,
      remainingSeconds: Math.max(0, durationSeconds),
    });

    return id;
  }

  advance(deltaSeconds: number): void {
    if (deltaSeconds <= 0) {
      return;
    }

    for (const [id, bubble] of this.bubbles.entries()) {
      const remaining = bubble.remainingSeconds - deltaSeconds;
      if (remaining <= 0) {
        this.bubbles.delete(id);
      } else {
        bubble.remainingSeconds = remaining;
      }
    }
  }

  getBubbles(): PanicBubbleSnapshot[] {
    return Array.from(this.bubbles.values()).map((bubble) => ({ ...bubble }));
  }

  getBubbleCount(): number {
    return this.bubbles.size;
  }

  applyToTargets(targets: PanicTarget[]): string[] {
    const affected = new Set<string>();

    for (const bubble of this.bubbles.values()) {
      const radiusSquared = bubble.radius * bubble.radius;
      for (const target of targets) {
        if (affected.has(target.id)) {
          continue;
        }

        const dx = target.x - bubble.x;
        const dy = target.y - bubble.y;
        if (dx * dx + dy * dy <= radiusSquared) {
          target.panic();
          affected.add(target.id);
        }
      }
    }

    return Array.from(affected);
  }
}
