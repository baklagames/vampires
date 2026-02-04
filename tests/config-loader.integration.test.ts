import { readFile } from "node:fs/promises";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadConfig } from "../src/config/loader";

const buildFetchResponse = (text: string, ok = true) =>
  ({
    ok,
    status: ok ? 200 : 404,
    statusText: ok ? "OK" : "Not Found",
    text: async () => text,
  }) as Response;

describe("config loader integration", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("loads the default config file", async () => {
    const filePath = path.resolve("assets/config/default.yaml");
    const raw = await readFile(filePath, "utf-8");

    globalThis.fetch = (async () => buildFetchResponse(raw)) as typeof fetch;

    const config = await loadConfig(filePath);

    expect(config.game.version).toBe("0.1");
    expect(config.dayNight.cycle.totalSeconds).toBe(420);
  });

  it("applies defaults when fields are missing", async () => {
    const minimalYaml = `game:\n  version: "0.1"\n`;

    globalThis.fetch = (async () => buildFetchResponse(minimalYaml)) as typeof fetch;

    const config = await loadConfig("minimal.yaml");

    expect(config.controls.tapToMove.enabled).toBe(true);
    expect(config.player.name.manualInput.onInvalid).toBe("reject");
  });

  it("throws a friendly error for invalid config", async () => {
    globalThis.fetch = (async () => buildFetchResponse("::bad:::")) as typeof fetch;

    await expect(loadConfig("invalid.yaml")).rejects.toThrow(
      "Invalid config",
    );
  });

  it("throws when the config file cannot be loaded", async () => {
    globalThis.fetch = (async () =>
      buildFetchResponse("", false)) as typeof fetch;

    await expect(loadConfig("missing.yaml")).rejects.toThrow(
      "Failed to load config",
    );
  });
});
