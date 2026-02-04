import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { DayNightController } from "../src/controllers/day-night";

describe("DayNightController", () => {
  it("transitions through cycle phases based on elapsed time", () => {
    const config = ConfigSchema.parse({});
    config.dayNight.cycle = {
      totalSeconds: 10,
      daySeconds: 4,
      duskSeconds: 1,
      nightSeconds: 3,
      dawnSeconds: 2,
    };

    const controller = new DayNightController(config);

    expect(controller.getPhase()).toBe("day");

    controller.advance(4);
    expect(controller.getPhase()).toBe("dusk");

    controller.advance(1);
    expect(controller.getPhase()).toBe("night");

    controller.advance(3);
    expect(controller.getPhase()).toBe("dawn");

    controller.advance(2);
    expect(controller.getPhase()).toBe("day");
  });

  it("emits a phase change event when the phase updates", () => {
    const config = ConfigSchema.parse({
      dayNight: {
        cycle: {
          totalSeconds: 10,
          daySeconds: 4,
          duskSeconds: 1,
          nightSeconds: 3,
          dawnSeconds: 2,
        },
      },
    });
    const controller = new DayNightController(config);
    const events: Array<{ from: string; to: string }> = [];
    controller.onPhaseChange((event) => {
      events.push({ from: event.from, to: event.to });
    });

    controller.advance(4);

    expect(events).toEqual([{ from: "day", to: "dusk" }]);
  });

  it("exposes npc and police multipliers per phase", () => {
    const config = ConfigSchema.parse({
      dayNight: {
        cycle: {
          totalSeconds: 10,
          daySeconds: 4,
          duskSeconds: 1,
          nightSeconds: 3,
          dawnSeconds: 2,
        },
        npcDensity: {
          dayMultiplier: 1,
          nightMultiplier: 0.5,
        },
      },
      police: {
        spawn: {
          nightMultiplier: 2,
        },
      },
    });

    const controller = new DayNightController(config);

    expect(controller.getNpcDensityMultiplier()).toBe(1);
    expect(controller.getPolicePresenceMultiplier()).toBe(1);

    controller.advance(5);

    expect(controller.getNpcDensityMultiplier()).toBe(0.5);
    expect(controller.getPolicePresenceMultiplier()).toBe(2);
  });

  it("notifies warning listeners on dusk and dawn", () => {
    const config = ConfigSchema.parse({
      dayNight: {
        cycle: {
          totalSeconds: 10,
          daySeconds: 4,
          duskSeconds: 1,
          nightSeconds: 3,
          dawnSeconds: 2,
        },
      },
    });
    const controller = new DayNightController(config);
    const warnings: Array<{ from: string; to: string }> = [];
    controller.onPhaseWarning((event) => {
      warnings.push({ from: event.from, to: event.to });
    });

    controller.advance(4);
    controller.advance(1);
    controller.advance(3);

    expect(warnings).toEqual([
      { from: "day", to: "dusk" },
      { from: "night", to: "dawn" },
    ]);
  });
});
