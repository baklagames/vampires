import Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import { PoliceChaseController } from "../controllers/police-chase";
import type { WorldGrid } from "../systems/world-grid";

export class PoliceNpc extends Phaser.GameObjects.Sprite {
  private readonly config: Readonly<GameConfig>;
  private readonly worldGrid: WorldGrid;
  private readonly chase: PoliceChaseController;
  private target: { x: number; y: number } | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: Readonly<GameConfig>,
    worldGrid: WorldGrid,
  ) {
    super(scene, x, y, texture);
    this.config = config;
    this.worldGrid = worldGrid;
    this.chase = new PoliceChaseController(config);
    this.setDepth(70);
    this.setScale(1.35);
    this.setTint(0xffffff);
    this.setAlpha(1);
    this.setFrame(3);
  }

  setTarget(position: { x: number; y: number } | null, nowMs: number): void {
    this.target = position ? { ...position } : null;
    if (position) {
      this.chase.spotTarget(position, nowMs);
    } else {
      this.chase.loseTarget(nowMs);
    }
  }

  update(time: number, delta: number): void {
    const nowMs = time;
    this.chase.advance(nowMs);
    if (!this.target) {
      return;
    }

    const state = this.chase.getState();
    const speedPixels = state.speed * this.worldGrid.tileSize;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0) {
      return;
    }

    const step = Math.min(distance, speedPixels * (delta / 1000));
    const ratio = step / distance;
    this.setPosition(this.x + dx * ratio, this.y + dy * ratio);
  }
}
