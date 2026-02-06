import type { GameConfig } from "../config/schema";

export type PlayerAction =
  | "idle"
  | "moving"
  | "feeding"
  | "hiding"
  | "escaping"
  | "dead";

export type PlayerState = {
  health: number;
  blood: number;
  position: { x: number; y: number };
  action: PlayerAction;
  actionEndsAtMs: number | null;
  cooldowns: {
    biteReadyAtMs: number;
    hideReadyAtMs: number;
    escapeReadyAtMs: number;
  };
};

export type PlayerActionResult = {
  state: PlayerState;
  accepted: boolean;
};

export type PlayerControllerOptions = {
  initialPosition?: { x: number; y: number };
  initialHealth?: number;
  initialBlood?: number;
};

export class PlayerController {
  private readonly config: Readonly<GameConfig>;
  private state: PlayerState;

  constructor(config: Readonly<GameConfig>, options: PlayerControllerOptions = {}) {
    this.config = config;
    const maxHealth = this.config.player.stats.maxHealth;
    const maxBlood = this.config.player.stats.maxBlood;

    this.state = {
      health: clamp(options.initialHealth ?? maxHealth, 0, maxHealth),
      blood: clamp(options.initialBlood ?? this.config.player.blood.startingBlood, 0, maxBlood),
      position: options.initialPosition ?? { x: 0, y: 0 },
      action: "idle",
      actionEndsAtMs: null,
      cooldowns: {
        biteReadyAtMs: 0,
        hideReadyAtMs: 0,
        escapeReadyAtMs: 0,
      },
    };
  }

  getState(): PlayerState {
    return {
      ...this.state,
      position: { ...this.state.position },
      cooldowns: { ...this.state.cooldowns },
    };
  }

  getMoveSpeed(): number {
    return this.config.player.stats.moveSpeed;
  }

  setPosition(position: { x: number; y: number }): void {
    this.state.position = { ...position };
  }

  applyDamage(amount: number): PlayerState {
    if (amount <= 0 || this.state.action === "dead") {
      return this.getState();
    }

    const nextHealth = clamp(this.state.health - amount, 0, this.config.player.stats.maxHealth);
    this.state.health = nextHealth;
    if (nextHealth <= 0) {
      this.state.action = "dead";
      this.state.actionEndsAtMs = null;
    }

    return this.getState();
  }

  heal(amount: number): PlayerState {
    if (amount <= 0 || this.state.action === "dead") {
      return this.getState();
    }

    this.state.health = clamp(
      this.state.health + amount,
      0,
      this.config.player.stats.maxHealth,
    );
    return this.getState();
  }

  addBlood(amount: number): PlayerState {
    if (amount <= 0 || this.state.action === "dead") {
      return this.getState();
    }

    this.state.blood = clamp(
      this.state.blood + amount,
      0,
      this.config.player.stats.maxBlood,
    );
    return this.getState();
  }

  spendBlood(amount: number): PlayerState {
    if (amount <= 0 || this.state.action === "dead") {
      return this.getState();
    }

    this.state.blood = clamp(this.state.blood - amount, 0, this.config.player.stats.maxBlood);
    return this.getState();
  }

  startMoving(): PlayerActionResult {
    if (!this.canChangeAction() || this.state.action === "dead") {
      return { state: this.getState(), accepted: false };
    }

    this.state.action = "moving";
    this.state.actionEndsAtMs = null;
    return { state: this.getState(), accepted: true };
  }

  stopMoving(): PlayerActionResult {
    if (this.state.action !== "moving") {
      return { state: this.getState(), accepted: false };
    }

    this.state.action = "idle";
    this.state.actionEndsAtMs = null;
    return { state: this.getState(), accepted: true };
  }

  startFeeding(nowMs: number, durationMs: number): PlayerActionResult {
    if (!this.canStartTimedAction(nowMs) || !this.isBiteReady(nowMs)) {
      return { state: this.getState(), accepted: false };
    }

    this.state.action = "feeding";
    this.state.actionEndsAtMs = nowMs + Math.max(0, durationMs);
    this.state.cooldowns.biteReadyAtMs =
      nowMs + this.config.player.actions.biteCooldownSeconds * 1000;
    return { state: this.getState(), accepted: true };
  }

  startHiding(nowMs: number, durationMs: number): PlayerActionResult {
    if (!this.canStartTimedAction(nowMs) || !this.isHideReady(nowMs)) {
      return { state: this.getState(), accepted: false };
    }

    this.state.action = "hiding";
    this.state.actionEndsAtMs = nowMs + Math.max(0, durationMs);
    this.state.cooldowns.hideReadyAtMs =
      nowMs + this.config.player.actions.hideCooldownSeconds * 1000;
    return { state: this.getState(), accepted: true };
  }

  startEscape(nowMs: number, durationMs: number): PlayerActionResult {
    if (!this.canStartTimedAction(nowMs) || !this.isEscapeReady(nowMs)) {
      return { state: this.getState(), accepted: false };
    }

    this.state.action = "escaping";
    this.state.actionEndsAtMs = nowMs + Math.max(0, durationMs);
    this.state.cooldowns.escapeReadyAtMs =
      nowMs + this.config.player.actions.escapeCooldownSeconds * 1000;
    return { state: this.getState(), accepted: true };
  }

  cancelAction(): PlayerActionResult {
    if (this.state.action === "dead") {
      return { state: this.getState(), accepted: false };
    }

    if (this.state.action === "idle") {
      return { state: this.getState(), accepted: false };
    }

    this.state.action = "idle";
    this.state.actionEndsAtMs = null;
    return { state: this.getState(), accepted: true };
  }

  advance(nowMs: number): PlayerState {
    if (this.state.actionEndsAtMs !== null && nowMs >= this.state.actionEndsAtMs) {
      this.state.action = "idle";
      this.state.actionEndsAtMs = null;
    }
    return this.getState();
  }

  isBiteReady(nowMs: number): boolean {
    return nowMs >= this.state.cooldowns.biteReadyAtMs;
  }

  isHideReady(nowMs: number): boolean {
    return nowMs >= this.state.cooldowns.hideReadyAtMs;
  }

  isEscapeReady(nowMs: number): boolean {
    return nowMs >= this.state.cooldowns.escapeReadyAtMs;
  }

  private canChangeAction(): boolean {
    return this.state.action === "idle" || this.state.action === "moving";
  }

  private canStartTimedAction(nowMs: number): boolean {
    if (this.state.action === "dead") {
      return false;
    }
    if (this.state.action === "feeding" || this.state.action === "hiding" || this.state.action === "escaping") {
      return false;
    }
    return nowMs >= (this.state.actionEndsAtMs ?? nowMs);
  }
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
