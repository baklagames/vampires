import { describe, expect, it } from "vitest";

import { buildDefaultConfig } from "../src/config/loader";
import { createSaveStorage } from "../src/ui/save-storage";

describe("SaveStorage", () => {
  it("round-trips save data", () => {
    const config = buildDefaultConfig();
    const memory = new Map<string, string>();
    const storage: Storage = {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value);
      },
      removeItem: (key) => {
        memory.delete(key);
      },
      clear: () => {
        memory.clear();
      },
      key: (index) => Array.from(memory.keys())[index] ?? null,
      get length() {
        return memory.size;
      },
    };

    const saveStorage = createSaveStorage(storage, config);
    const initial = saveStorage.load();
    expect(initial.playerName).toBe("Vampire");

    const next = {
      ...initial,
      playerName: "Nyx",
      upgrades: { owned: ["upgrade-2"] },
    };
    saveStorage.save(next);

    const loaded = saveStorage.load();
    expect(loaded.playerName).toBe("Nyx");
    expect(loaded.upgrades.owned).toEqual(["upgrade-2"]);
  });
});
