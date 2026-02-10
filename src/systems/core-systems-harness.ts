import type { GameConfig } from "../config/schema";
import type { SunShadeMap, DayPhase } from "./sun-shade-map";
import { FeedingSystem, type FeedingEvent, type FeedingStatus } from "../controllers/feeding-system";
import { HeatController, type HeatState } from "../controllers/heat-controller";
import { PlayerController, type PlayerState } from "../controllers/player-controller";
import { SunDamageSystem, type SunDamageState } from "./sun-damage";

export type CoreSystemsSnapshot = {
  player: PlayerState;
  feeding: FeedingStatus;
  heat: HeatState;
  sun: SunDamageState;
};

export type CoreSystemsAdvanceContext = {
  position: { x: number; y: number };
  sunMap: SunShadeMap;
  phase: DayPhase;
  inPanic: boolean;
  inChase: boolean;
};

export class CoreSystemsHarness {
  private readonly config: Readonly<GameConfig>;
  private readonly player: PlayerController;
  private readonly feeding: FeedingSystem;
  private readonly heat: HeatController;
  private readonly sun: SunDamageSystem;

  constructor(config: Readonly<GameConfig>, options?: { initialPosition?: { x: number; y: number } }) {
    this.config = config;
    this.player = new PlayerController(config, { initialPosition: options?.initialPosition });
    this.feeding = new FeedingSystem(config);
    this.heat = new HeatController(config);
    this.sun = new SunDamageSystem(config);
  }

  getSnapshot(nowMs: number, context: Pick<CoreSystemsAdvanceContext, "position" | "sunMap" | "phase">): CoreSystemsSnapshot {
    return {
      player: this.player.getState(),
      feeding: this.feeding.getStatus(nowMs),
      heat: this.heat.getState(),
      sun: this.sun.getState(this.isInSun(context)),
    };
  }

  startFeeding(nowMs: number, targetId: string): { accepted: boolean; event: FeedingEvent | null } {
    const durationMs = this.config.feeding.bite.baseDurationSeconds * 1000;
    const playerResult = this.player.startFeeding(nowMs, durationMs);
    if (!playerResult.accepted) {
      return { accepted: false, event: null };
    }

    const event = this.feeding.start(nowMs, targetId);
    if (!event) {
      this.player.cancelAction();
      return { accepted: false, event: null };
    }

    return { accepted: true, event };
  }

  interruptFeeding(nowMs: number): FeedingEvent | null {
    const event = this.feeding.interrupt(nowMs);
    if (event) {
      this.player.cancelAction();
    }
    return event;
  }

  recordHeatEvent(type: "bite" | "kill" | "witness", nowMs: number): HeatState {
    return this.heat.addHeat(type, nowMs);
  }

  respawn(position: { x: number; y: number }): CoreSystemsSnapshot {
    this.player.respawn(position);
    return {
      player: this.player.getState(),
      feeding: this.feeding.getStatus(0),
      heat: this.heat.getState(),
      sun: this.sun.getState(false),
    };
  }

  advance(nowMs: number, deltaMs: number, context: CoreSystemsAdvanceContext): { snapshot: CoreSystemsSnapshot; feedingEvent: FeedingEvent | null } {
    const deltaSeconds = deltaMs / 1000;
    this.player.setPosition(context.position);
    this.player.advance(nowMs);

    if (context.inPanic) {
      this.heat.addHeatAmount(this.config.heat.increase.perSecondInPanic * deltaSeconds, nowMs);
    }
    if (context.inChase) {
      this.heat.addHeatAmount(this.config.heat.increase.perSecondInChase * deltaSeconds, nowMs);
    }
    this.heat.advance(deltaSeconds, nowMs);

    const sunResult = this.sun.apply(deltaMs, context.position, context.sunMap, context.phase);
    if (sunResult.damage > 0) {
      this.player.applyDamage(sunResult.damage);
    }

    const feedingEvent = this.feeding.advance(nowMs);
    if (feedingEvent?.type === "completed") {
      this.player.addBlood(feedingEvent.rewardBlood);
    }

    return { snapshot: this.getSnapshot(nowMs, context), feedingEvent };
  }

  private isInSun(context: Pick<CoreSystemsAdvanceContext, "position" | "sunMap" | "phase">): boolean {
    const safe = context.sunMap.isSafe(context.position.x, context.position.y);
    const sunActive = context.phase === "day" || context.phase === "dusk";
    return sunActive && !safe;
  }
}
