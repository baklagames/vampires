import { describe, expect, it } from "vitest";

import { buildDefaultConfig } from "../src/config/loader";
import { buildMainMenuState } from "../src/ui/screens/main-menu";
import { buildSettingsState } from "../src/ui/screens/settings";
import { buildSplashState } from "../src/ui/screens/splash";
import { buildCharacterSelectState } from "../src/ui/screens/character-select";
import { buildCastleBaseState } from "../src/ui/screens/castle-base";
import { buildUpgradesState } from "../src/ui/screens/upgrades";
import { createSaveStorage } from "../src/ui/save-storage";
import { buildPauseMenuState } from "../src/ui/screens/pause";
import { buildDeathScreenState } from "../src/ui/screens/death";
import { buildCreditsState } from "../src/ui/screens/credits";
import { buildInteriorGameplayState, buildTownGameplayState } from "../src/ui/screens/town-gameplay";

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
    const config = buildDefaultConfig();
    config.player = {
      ...config.player,
      name: {
        ...config.player.name,
        manualInput: {
          ...config.player.name.manualInput,
          regex: "^[A-Za-z0-9]{3,12}$",
        },
      },
    };

    const valid = buildSettingsState(config, "Dracula");
    const invalid = buildSettingsState(config, "??");

    expect(valid.playerNameValid).toBe(true);
    expect(invalid.playerNameValid).toBe(false);
  });

  it("builds the remaining screen states", () => {
    const config = buildDefaultConfig();
    expect(buildCharacterSelectState(config, "Ada").cards).toHaveLength(6);
    expect(buildCastleBaseState().title).toBe("Castle");
    const configWithUpgrades = {
      ...config,
      upgrades: {
        ...config.upgrades,
        items: [
          {
            id: "upgrade-1",
            name: "Shadow Step",
            description: "Short dash to evade",
            cost: 50,
          },
        ],
      },
    };
    const save = createSaveStorage(
      {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      },
      configWithUpgrades,
    ).load();
    expect(buildUpgradesState(configWithUpgrades, save).items.length).toBeGreaterThan(0);
    expect(buildPauseMenuState().sheet.open).toBe(true);
    expect(buildDeathScreenState("sun").title).toBe("You Died");
    expect(buildCreditsState().title).toBe("Credits");
    expect(buildTownGameplayState().title).toBe("Town");
    expect(buildInteriorGameplayState().title).toBe("Interior");
  });
});
