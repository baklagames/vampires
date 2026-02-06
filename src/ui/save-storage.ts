import type { GameConfig } from "../config/schema";
import type { SettingsState } from "./settings-storage";

export type SaveState = {
  playerName: string;
  settings: SettingsState;
  upgrades: {
    owned: string[];
  };
};

export type SaveStorage = {
  load: () => SaveState;
  save: (state: SaveState) => void;
};

const STORAGE_KEY = "vampires.save";

export const createSaveStorage = (
  storage: Storage,
  config: Readonly<GameConfig>,
): SaveStorage => ({
  load: () => {
    const raw = storage.getItem(STORAGE_KEY);
    const defaults = buildDefaultSave(config);
    if (!raw) {
      return defaults;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SaveState>;
      return {
        playerName: parsed.playerName ?? defaults.playerName,
        settings: {
          musicEnabled: parsed.settings?.musicEnabled ?? defaults.settings.musicEnabled,
          sfxEnabled: parsed.settings?.sfxEnabled ?? defaults.settings.sfxEnabled,
        },
        upgrades: {
          owned: parsed.upgrades?.owned ?? defaults.upgrades.owned,
        },
      };
    } catch {
      return defaults;
    }
  },
  save: (state) => {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
});

const buildDefaultSave = (config: Readonly<GameConfig>): SaveState => ({
  playerName: "Vampire",
  settings: {
    musicEnabled: true,
    sfxEnabled: true,
  },
  upgrades: {
    owned: config.upgrades.items
      .slice(0, config.upgrades.slots.startingUnlocked)
      .map((item) => item.id),
  },
});
