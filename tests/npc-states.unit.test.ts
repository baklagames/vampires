import { describe, expect, it, vi } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { createAlarmedState, createIdleWanderState, createStateContext, createSuspiciousState } from "../src/controllers/npc-states";

const createRuntime = () => {
  let position = { x: 0, y: 0 };
  let destination: { x: number; y: number } | null = null;
  let speed = 1;
  let lastKnown: { x: number; y: number } | null = null;
  let alertCount = 0;
  let reached = false;

  return {
    runtime: {
      getPosition: () => position,
      getDestination: () => destination,
      setDestination: (point: { x: number; y: number } | null) => {
        destination = point;
      },
      hasReachedDestination: () => reached,
      setSpeedMultiplier: (value: number) => {
        speed = value;
      },
      getLastKnownTarget: () => lastKnown,
      setLastKnownTarget: (point: { x: number; y: number } | null) => {
        lastKnown = point;
      },
      alertNeighbors: () => {
        alertCount += 1;
      },
    },
    getState: () => ({ position, destination, speed, lastKnown, alertCount }),
    setReached: (value: boolean) => {
      reached = value;
    },
  };
};

describe("npc states", () => {
  it("idle wander picks a destination after pause", () => {
    const config = ConfigSchema.parse({
      npc: {
        behavior: {
          idleWanderRadiusTiles: 2,
          idlePauseSeconds: 0,
        },
      },
    });
    const { runtime, getState } = createRuntime();
    const rng = { next: () => 0.5 };
    const state = createIdleWanderState(config, runtime, rng);

    state.onEnter(createStateContext(0, 0));
    state.update(createStateContext(0, 0));

    const dest = getState().destination;
    expect(dest).not.toBeNull();
  });

  it("suspicious state expires after timeout", () => {
    const config = ConfigSchema.parse({
      npc: {
        detection: {
          suspicionSeconds: 1,
        },
      },
    });
    const { runtime } = createRuntime();
    runtime.setLastKnownTarget({ x: 1, y: 1 });
    const onExpired = vi.fn();
    const state = createSuspiciousState(config, runtime, { onSuspicionExpired: onExpired });

    state.onEnter(createStateContext(0, 0));
    state.update(createStateContext(999, 0));
    expect(onExpired).not.toHaveBeenCalled();

    state.update(createStateContext(1000, 0));
    expect(onExpired).toHaveBeenCalled();
  });

  it("alarmed state alerts and expires", () => {
    const config = ConfigSchema.parse({
      npc: {
        behavior: {
          panicDurationSeconds: 1,
          fleeSpeedMultiplier: 2,
        },
      },
    });
    const { runtime, getState } = createRuntime();
    const onExpired = vi.fn();
    const state = createAlarmedState(config, runtime, { onAlarmExpired: onExpired });

    state.onEnter(createStateContext(0, 0));
    expect(getState().alertCount).toBe(1);

    state.update(createStateContext(1000, 0));
    expect(onExpired).toHaveBeenCalled();
  });
});
