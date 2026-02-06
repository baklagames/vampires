import type { GameConfig } from "../config/schema";

export type FeedingState = "idle" | "feeding";

export type FeedingStatus = {
  state: FeedingState;
  targetId: string | null;
  startedAtMs: number | null;
  endsAtMs: number | null;
  progress: number;
  interruptible: boolean;
  durationMs: number;
};

export type FeedingEvent =
  | { type: "started"; atMs: number; targetId: string }
  | { type: "completed"; atMs: number; targetId: string; rewardBlood: number }
  | { type: "interrupted"; atMs: number; targetId: string };

export type FeedingStartOptions = {
  durationSeconds?: number;
};

export class FeedingSystem {
  private readonly config: Readonly<GameConfig>;
  private state: FeedingState = "idle";
  private targetId: string | null = null;
  private startedAtMs: number | null = null;
  private endsAtMs: number | null = null;
  private rewardGranted = false;

  constructor(config: Readonly<GameConfig>) {
    this.config = config;
  }

  getStatus(nowMs: number): FeedingStatus {
    const durationMs = this.getDurationMs();
    const progress = this.state === "feeding" && this.startedAtMs !== null
      ? clamp((nowMs - this.startedAtMs) / durationMs, 0, 1)
      : 0;

    return {
      state: this.state,
      targetId: this.targetId,
      startedAtMs: this.startedAtMs,
      endsAtMs: this.endsAtMs,
      progress,
      interruptible: this.config.feeding.bite.interruptible,
      durationMs,
    };
  }

  start(nowMs: number, targetId: string, options: FeedingStartOptions = {}): FeedingEvent | null {
    if (this.state === "feeding") {
      return null;
    }

    const durationMs = Math.max(0, (options.durationSeconds ?? this.config.feeding.bite.baseDurationSeconds) * 1000);

    this.state = "feeding";
    this.targetId = targetId;
    this.startedAtMs = nowMs;
    this.endsAtMs = nowMs + durationMs;
    this.rewardGranted = false;

    return { type: "started", atMs: nowMs, targetId };
  }

  interrupt(nowMs: number): FeedingEvent | null {
    if (this.state !== "feeding" || !this.config.feeding.bite.interruptible) {
      return null;
    }

    const targetId = this.targetId;
    this.reset();
    if (!targetId) {
      return null;
    }

    return { type: "interrupted", atMs: nowMs, targetId };
  }

  advance(nowMs: number): FeedingEvent | null {
    if (this.state !== "feeding" || this.endsAtMs === null || this.startedAtMs === null) {
      return null;
    }

    if (nowMs < this.endsAtMs) {
      return null;
    }

    if (this.rewardGranted) {
      return null;
    }

    const targetId = this.targetId;
    this.rewardGranted = true;
    this.reset();

    if (!targetId) {
      return null;
    }

    return {
      type: "completed",
      atMs: nowMs,
      targetId,
      rewardBlood: this.config.feeding.reward.baseBloodGain,
    };
  }

  private getDurationMs(): number {
    return Math.max(0, this.config.feeding.bite.baseDurationSeconds * 1000);
  }

  private reset(): void {
    this.state = "idle";
    this.targetId = null;
    this.startedAtMs = null;
    this.endsAtMs = null;
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
