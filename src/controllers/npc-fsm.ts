export type NpcStateId = string;

export type NpcStateContext = {
  nowMs: number;
  deltaMs: number;
};

export interface NpcState {
  readonly id: NpcStateId;
  onEnter: (context: NpcStateContext) => void;
  onExit: (context: NpcStateContext) => void;
  update: (context: NpcStateContext) => void;
}

export type NpcStateFactory = () => NpcState;

export class NpcStateMachine {
  private states = new Map<NpcStateId, NpcStateFactory>();
  private current: NpcState | null = null;
  private currentId: NpcStateId | null = null;

  register(state: NpcStateFactory): void {
    const instance = state();
    this.states.set(instance.id, state);
  }

  getStateId(): NpcStateId | null {
    return this.currentId;
  }

  changeState(nextId: NpcStateId, context: NpcStateContext): void {
    if (this.currentId === nextId) {
      return;
    }

    const factory = this.states.get(nextId);
    if (!factory) {
      throw new Error(`NPC state "${nextId}" is not registered.`);
    }

    this.current?.onExit(context);
    this.current = factory();
    this.currentId = nextId;
    this.current.onEnter(context);
  }

  update(context: NpcStateContext): void {
    if (!this.current) {
      return;
    }
    this.current.update(context);
  }
}
