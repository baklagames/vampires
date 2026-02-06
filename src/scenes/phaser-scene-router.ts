import Phaser from "phaser";

import { SceneTransitionManager, type PlayerState } from "./scene-transition-manager";

export class PhaserSceneRouter {
  private readonly manager: SceneTransitionManager;

  constructor(manager: SceneTransitionManager) {
    this.manager = manager;
  }

  transition(scene: Phaser.Scene, to: string, playerState: PlayerState): void {
    const payload = this.manager.transition(to, playerState);
    scene.scene.start(to, payload);
  }
}
