import type { GameConfig } from "../config/schema";
import type { NpcState, NpcStateContext } from "./npc-fsm";

export type NpcPosition = { x: number; y: number };

export type NpcRuntime = {
  getPosition: () => NpcPosition;
  getDestination: () => NpcPosition | null;
  setDestination: (point: NpcPosition | null) => void;
  hasReachedDestination: () => boolean;
  setSpeedMultiplier: (value: number) => void;
  getLastKnownTarget: () => NpcPosition | null;
  setLastKnownTarget: (point: NpcPosition | null) => void;
  alertNeighbors: () => void;
};

export type NpcStateCallbacks = {
  onSuspicionExpired?: () => void;
  onAlarmExpired?: () => void;
};

export type NpcRandom = {
  next: () => number;
};

const toMs = (seconds: number): number => seconds * 1000;

export const createIdleWanderState = (
  config: Readonly<GameConfig>,
  runtime: NpcRuntime,
  rng: NpcRandom,
): NpcState => {
  let nextDecisionAtMs = 0;

  return {
    id: "idle",
    onEnter: (context) => {
      nextDecisionAtMs = context.nowMs + toMs(config.npc.behavior.idlePauseSeconds);
      runtime.setSpeedMultiplier(1);
    },
    onExit: () => {
      nextDecisionAtMs = 0;
    },
    update: (context) => {
      if (context.nowMs < nextDecisionAtMs) {
        return;
      }

      if (runtime.getDestination() && !runtime.hasReachedDestination()) {
        return;
      }

      const origin = runtime.getPosition();
      const radius = config.npc.behavior.idleWanderRadiusTiles;
      const destination = randomPointInRadius(origin, radius, rng);
      runtime.setDestination(destination);
      nextDecisionAtMs = context.nowMs + toMs(config.npc.behavior.idlePauseSeconds);
    },
  };
};

export const createSuspiciousState = (
  config: Readonly<GameConfig>,
  runtime: NpcRuntime,
  callbacks: NpcStateCallbacks = {},
): NpcState => {
  let expiresAtMs = 0;

  return {
    id: "suspicious",
    onEnter: (context) => {
      expiresAtMs = context.nowMs + toMs(config.npc.detection.suspicionSeconds);
      const lastKnown = runtime.getLastKnownTarget();
      if (lastKnown) {
        runtime.setDestination(lastKnown);
      }
    },
    onExit: () => {
      expiresAtMs = 0;
    },
    update: (context) => {
      if (expiresAtMs > 0 && context.nowMs >= expiresAtMs) {
        callbacks.onSuspicionExpired?.();
      }
    },
  };
};

export const createAlarmedState = (
  config: Readonly<GameConfig>,
  runtime: NpcRuntime,
  callbacks: NpcStateCallbacks = {},
): NpcState => {
  let expiresAtMs = 0;

  return {
    id: "alarmed",
    onEnter: (context) => {
      expiresAtMs = context.nowMs + toMs(config.npc.behavior.panicDurationSeconds);
      runtime.setSpeedMultiplier(config.npc.behavior.fleeSpeedMultiplier);
      runtime.alertNeighbors();
    },
    onExit: () => {
      expiresAtMs = 0;
      runtime.setSpeedMultiplier(1);
    },
    update: (context) => {
      if (expiresAtMs > 0 && context.nowMs >= expiresAtMs) {
        callbacks.onAlarmExpired?.();
      }
    },
  };
};

const randomPointInRadius = (
  origin: NpcPosition,
  radius: number,
  rng: NpcRandom,
): NpcPosition => {
  const angle = rng.next() * Math.PI * 2;
  const distance = rng.next() * radius;
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance;

  return {
    x: origin.x + dx,
    y: origin.y + dy,
  };
};

export const createStateContext = (nowMs: number, deltaMs: number): NpcStateContext => ({
  nowMs,
  deltaMs,
});
