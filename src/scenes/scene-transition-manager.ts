export type PlayerState = {
  health: number;
  inventory: Record<string, number>;
  position: { x: number; y: number };
};

export type SceneTransitionPayload = {
  from: string;
  to: string;
  playerState: PlayerState;
};

export type SceneTransitionManagerOptions = {
  initialScene: string;
  initialPlayerState: PlayerState;
};

export class SceneTransitionManager {
  private currentScene: string;
  private playerState: PlayerState;

  constructor(options: SceneTransitionManagerOptions) {
    this.currentScene = options.initialScene;
    this.playerState = { ...options.initialPlayerState };
  }

  getScene(): string {
    return this.currentScene;
  }

  getPlayerState(): PlayerState {
    return { ...this.playerState, position: { ...this.playerState.position } };
  }

  transition(to: string, nextState: PlayerState): SceneTransitionPayload {
    const payload: SceneTransitionPayload = {
      from: this.currentScene,
      to,
      playerState: nextState,
    };

    this.currentScene = to;
    this.playerState = {
      ...nextState,
      position: { ...nextState.position },
    };

    return payload;
  }
}
