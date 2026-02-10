import Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import type { WorldGrid } from "../systems/world-grid";

export type HumanNpcType =
  | "adultMale"
  | "adultFemale"
  | "kid"
  | "grandma"
  | "grandpa";

export type HumanNpcOptions = {
  npcType: HumanNpcType;
  worldGrid: WorldGrid;
  config: Readonly<GameConfig>;
};

export class HumanNpc extends Phaser.GameObjects.Sprite {
  private static nextId = 1;
  private readonly id: string;
  private readonly config: Readonly<GameConfig>;
  private readonly worldGrid: WorldGrid;
  private npcType: HumanNpcType;
  private speed: number;
  private phaseSpeedMultiplier = 1;
  private destination: { x: number; y: number } | null = null;
  private nextDecisionAtMs = 0;
  private panicUntilMs = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    options: HumanNpcOptions,
  ) {
    super(scene, x, y, texture);
    this.id = `npc-${HumanNpc.nextId++}`;
    this.config = options.config;
    this.worldGrid = options.worldGrid;
    this.npcType = options.npcType;
    this.speed = this.resolveSpeed(options.npcType);
    this.setDepth(60);
    this.setScale(1.35);
    this.setTint(0xffffff);
    this.setAlpha(1);
    this.setFrame(1);
  }

  getId(): string {
    return this.id;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  setNpcType(type: HumanNpcType): void {
    this.npcType = type;
    this.speed = this.resolveSpeed(type);
  }

  setPhaseSpeedMultiplier(multiplier: number): void {
    this.phaseSpeedMultiplier = Math.max(0, multiplier);
    this.speed = this.resolveSpeed(this.npcType);
  }

  panic(nowMs: number): void {
    const durationMs = this.config.npc.behavior.panicDurationSeconds * 1000;
    this.panicUntilMs = Math.max(this.panicUntilMs, nowMs + durationMs);
  }

  update(time: number, delta: number): void {
    const nowMs = time;
    if (nowMs <= this.panicUntilMs) {
      this.speed = this.resolveSpeed(this.npcType) * this.config.npc.behavior.fleeSpeedMultiplier;
    } else {
      this.speed = this.resolveSpeed(this.npcType);
    }
    if (nowMs < this.nextDecisionAtMs) {
      this.advanceMovement(delta);
      return;
    }

    if (!this.destination || this.hasReachedDestination()) {
      this.pickDestination();
      const pauseMs = this.config.npc.behavior.idlePauseSeconds * 1000;
      this.nextDecisionAtMs = nowMs + pauseMs;
    }

    this.advanceMovement(delta);
  }

  private resolveSpeed(type: HumanNpcType): number {
    const base = this.config.humans.base.walkSpeed;
    const variant = this.config.humans.variants[type];
    return base * variant.speedMultiplier * this.phaseSpeedMultiplier;
  }

  private pickDestination(): void {
    const currentTile = this.worldGrid.worldToTile(this.x, this.y);
    const radius = Math.max(0, this.config.npc.behavior.idleWanderRadiusTiles);
    const attempts = this.config.npc.behavior.wanderPickAttempts;
    let target = currentTile;

    for (let i = 0; i < attempts; i += 1) {
      const offset = randomPointInRadius(radius);
      const candidate = {
        x: currentTile.x + offset.x,
        y: currentTile.y + offset.y,
      };
      if (this.worldGrid.isWalkable(candidate.x, candidate.y)) {
        target = candidate;
        break;
      }
    }

    const world = this.worldGrid.tileToWorld(target.x, target.y);
    this.destination = world;
  }

  private hasReachedDestination(): boolean {
    if (!this.destination) {
      return true;
    }

    const dx = this.destination.x - this.x;
    const dy = this.destination.y - this.y;
    const distance = Math.hypot(dx, dy);
    const threshold = this.config.controls.tapToMove.arrivalThresholdTiles * this.worldGrid.tileSize;
    return distance <= threshold;
  }

  private advanceMovement(deltaMs: number): void {
    if (!this.destination) {
      return;
    }

    const dx = this.destination.x - this.x;
    const dy = this.destination.y - this.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0) {
      return;
    }

    const speedPixels = this.speed * this.worldGrid.tileSize;
    const step = Math.min(distance, speedPixels * (deltaMs / 1000));
    const ratio = step / distance;
    this.setPosition(this.x + dx * ratio, this.y + dy * ratio);
  }
}

const randomPointInRadius = (radius: number): { x: number; y: number } => {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;
  return {
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance),
  };
};
