import type Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import type { WorldGrid } from "../systems/world-grid";
import { PoliceNpc } from "./police-npc";

export type PoliceSpawnPoint = { x: number; y: number };

export class PoliceManager {
  private readonly scene: Phaser.Scene;
  private readonly config: Readonly<GameConfig>;
  private readonly worldGrid: WorldGrid;
  private readonly textureKey: string;
  private readonly active: PoliceNpc[] = [];
  private readonly pool: PoliceNpc[] = [];

  constructor(
    scene: Phaser.Scene,
    config: Readonly<GameConfig>,
    worldGrid: WorldGrid,
    textureKey: string,
  ) {
    this.scene = scene;
    this.config = config;
    this.worldGrid = worldGrid;
    this.textureKey = textureKey;
  }

  spawn(points: PoliceSpawnPoint[]): void {
    if (!this.config.police.enabled) {
      return;
    }
    for (const point of points) {
      const npc = this.pool.pop() ?? new PoliceNpc(this.scene, point.x, point.y, this.textureKey, this.config, this.worldGrid);
      npc.setPosition(point.x, point.y);
      this.scene.add.existing(npc);
      this.active.push(npc);
    }
  }

  updateTarget(position: { x: number; y: number } | null, nowMs: number): void {
    for (const npc of this.active) {
      npc.setTarget(position, nowMs);
    }
  }

  update(time: number, delta: number): void {
    for (const npc of this.active) {
      npc.update(time, delta);
    }
  }

  getActiveCount(): number {
    return this.active.length;
  }
}
