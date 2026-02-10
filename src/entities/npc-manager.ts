import type Phaser from "phaser";

import type { GameConfig } from "../config/schema";
import type { WorldGrid } from "../systems/world-grid";
import { HumanNpc, type HumanNpcType } from "./human-npc";

export type NpcSpawnPoint = { x: number; y: number };

export class NpcManager {
  private readonly scene: Phaser.Scene;
  private readonly config: Readonly<GameConfig>;
  private readonly worldGrid: WorldGrid;
  private readonly textureKey: string;
  private readonly spawnPoints: NpcSpawnPoint[];
  private readonly pool: HumanNpc[] = [];
  private readonly active: HumanNpc[] = [];

  constructor(
    scene: Phaser.Scene,
    config: Readonly<GameConfig>,
    worldGrid: WorldGrid,
    textureKey: string,
    spawnPoints: NpcSpawnPoint[],
  ) {
    this.scene = scene;
    this.config = config;
    this.worldGrid = worldGrid;
    this.textureKey = textureKey;
    this.spawnPoints = spawnPoints;
  }

  getActiveCount(): number {
    return this.active.length;
  }

  getActive(): HumanNpc[] {
    return [...this.active];
  }

  spawnAt(x: number, y: number): void {
    this.spawnNpc(x, y);
  }

  update(time: number, delta: number): void {
    for (const npc of this.active) {
      npc.update(time, delta);
    }
  }

  findNearest(position: { x: number; y: number }, radius: number): HumanNpc | null {
    let nearest: HumanNpc | null = null;
    let nearestDistance = radius;
    for (const npc of this.active) {
      const npcPos = npc.getPosition();
      const distance = Math.hypot(position.x - npcPos.x, position.y - npcPos.y);
      if (distance <= nearestDistance) {
        nearest = npc;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  ensurePopulation(densityMultiplier: number): void {
    const maxActive = this.config.performance.maxActiveNpcs.town;
    const desired = Math.floor(maxActive * densityMultiplier);
    const spawnCount = Math.max(0, desired - this.active.length);
    if (spawnCount <= 0) {
      return;
    }

    const points = this.spawnPoints.length > 0 ? this.spawnPoints : this.getFallbackPoints();
    for (let i = 0; i < spawnCount; i += 1) {
      const point = points[i % points.length];
      this.spawnNpc(point.x, point.y);
    }
  }

  setPhaseSpeedMultiplier(multiplier: number): void {
    for (const npc of this.active) {
      npc.setPhaseSpeedMultiplier(multiplier);
    }
  }

  private spawnNpc(x: number, y: number): void {
    const type = this.randomNpcType();
    const npc = this.pool.pop() ?? new HumanNpc(this.scene, x, y, this.textureKey, {
      npcType: type,
      worldGrid: this.worldGrid,
      config: this.config,
    });
    npc.setNpcType(type);
    npc.setPosition(x, y);
    this.scene.add.existing(npc);
    this.active.push(npc);
  }

  private randomNpcType(): HumanNpcType {
    const types = Object.keys(this.config.humans.variants) as HumanNpcType[];
    const index = Math.floor(Math.random() * types.length);
    return types[index] ?? "adultMale";
  }

  private getFallbackPoints(): NpcSpawnPoint[] {
    const points: NpcSpawnPoint[] = [];
    for (let y = 0; y < this.worldGrid.height; y += 1) {
      for (let x = 0; x < this.worldGrid.width; x += 1) {
        if (this.worldGrid.isWalkable(x, y)) {
          const world = this.worldGrid.tileToWorld(x, y);
          points.push(world);
        }
      }
    }
    return points;
  }
}
