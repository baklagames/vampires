import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { buildMainMenuState } from "../src/ui/screens/main-menu";
import { buildSettingsState } from "../src/ui/screens/settings";
import { buildSplashState } from "../src/ui/screens/splash";

describe("Screens", () => {
  it("builds splash state", () => {
    const state = buildSplashState();
    expect(state.title).toBe("Vampires");
  });

  it("builds main menu state", () => {
    const state = buildMainMenuState();
    expect(state.actions).toContain("Start");
  });

  it("validates player name using config rules", () => {
    const config = ConfigSchema.parse({
      player: {
        name: {
          manualInput: {
            regex: "^[A-Za-z0-9]{3,12}$",
          },
        },
      },
    });

    const valid = buildSettingsState(config, "Dracula");
    const invalid = buildSettingsState(config, "??");

    expect(valid.playerNameValid).toBe(true);
    expect(invalid.playerNameValid).toBe(false);
  });
});
