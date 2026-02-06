import { describe, expect, it } from "vitest";

import { NpcStateMachine, type NpcStateContext } from "../src/controllers/npc-fsm";

const makeState = (id: string, calls: string[]) => ({
  id,
  onEnter: () => calls.push(`${id}:enter`),
  onExit: () => calls.push(`${id}:exit`),
  update: () => calls.push(`${id}:update`),
});

describe("NpcStateMachine", () => {
  it("calls enter/exit in order on transitions", () => {
    const calls: string[] = [];
    const machine = new NpcStateMachine();
    machine.register(() => makeState("idle", calls));
    machine.register(() => makeState("alert", calls));

    const context: NpcStateContext = { nowMs: 0, deltaMs: 0 };
    machine.changeState("idle", context);
    machine.changeState("alert", context);

    expect(calls).toEqual(["idle:enter", "idle:exit", "alert:enter"]);
  });

  it("updates current state", () => {
    const calls: string[] = [];
    const machine = new NpcStateMachine();
    machine.register(() => makeState("idle", calls));

    const context: NpcStateContext = { nowMs: 0, deltaMs: 16 };
    machine.changeState("idle", context);
    machine.update(context);

    expect(calls).toContain("idle:update");
  });

  it("throws when changing to missing state", () => {
    const machine = new NpcStateMachine();
    const context: NpcStateContext = { nowMs: 0, deltaMs: 0 };

    expect(() => machine.changeState("missing", context)).toThrow(
      /not registered/,
    );
  });

  it("does nothing if changing to same state", () => {
    const calls: string[] = [];
    const machine = new NpcStateMachine();
    machine.register(() => makeState("idle", calls));

    const context: NpcStateContext = { nowMs: 0, deltaMs: 0 };
    machine.changeState("idle", context);
    machine.changeState("idle", context);

    expect(calls).toEqual(["idle:enter"]);
  });
});
