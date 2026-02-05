import { describe, expect, it } from "vitest";

import { createSettingsStorage } from "../src/ui/settings-storage";

describe("SettingsStorage", () => {
  it("loads defaults and persists settings", () => {
    const memoryStorage = new Map<string, string>();
    const storage: Storage = {
      getItem: (key) => memoryStorage.get(key) ?? null,
      setItem: (key, value) => {
        memoryStorage.set(key, value);
      },
      removeItem: (key) => {
        memoryStorage.delete(key);
      },
      clear: () => {
        memoryStorage.clear();
      },
      key: (index) => Array.from(memoryStorage.keys())[index] ?? null,
      get length() {
        return memoryStorage.size;
      },
    };

    const settings = createSettingsStorage(storage);
    expect(settings.load()).toEqual({ musicEnabled: true, sfxEnabled: true });

    settings.save({ musicEnabled: false, sfxEnabled: true });
    expect(settings.load()).toEqual({ musicEnabled: false, sfxEnabled: true });
  });
});
