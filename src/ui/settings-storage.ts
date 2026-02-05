export type SettingsState = {
  musicEnabled: boolean;
  sfxEnabled: boolean;
};

export type SettingsStorage = {
  load: () => SettingsState;
  save: (state: SettingsState) => void;
};

const STORAGE_KEY = "vampires.settings";

export const createSettingsStorage = (storage: Storage): SettingsStorage => ({
  load: () => {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return { musicEnabled: true, sfxEnabled: true };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      return {
        musicEnabled: parsed.musicEnabled ?? true,
        sfxEnabled: parsed.sfxEnabled ?? true,
      };
    } catch {
      return { musicEnabled: true, sfxEnabled: true };
    }
  },
  save: (state) => {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
});
