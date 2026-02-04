import type { PlayerState, SceneTransitionManager } from "./scene-transition-manager";

export type DeathRespawnOptions = {
  castleSceneKey: string;
  castleSpawn: { x: number; y: number };
  respawnHealth: number;
};

export class DeathRespawnController {
  private readonly transitionManager: SceneTransitionManager;
  private readonly options: DeathRespawnOptions;

  constructor(
    transitionManager: SceneTransitionManager,
    options: DeathRespawnOptions,
  ) {
    this.transitionManager = transitionManager;
    this.options = options;
  }

  handleHealthChange(player: PlayerState, onFadeOut: () => void): PlayerState {
    if (player.health > 0) {
      return player;
    }

    onFadeOut();

    const nextState: PlayerState = {
      ...player,
      health: this.options.respawnHealth,
      position: { ...this.options.castleSpawn },
    };

    this.transitionManager.transition(this.options.castleSceneKey, nextState);
    return nextState;
  }
}
