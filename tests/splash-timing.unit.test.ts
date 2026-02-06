import { describe, expect, it } from "vitest";

import { ConfigSchema } from "../src/config/schema";
import { getSplashDelayMs } from "../src/ui/splash-timing";

describe("getSplashDelayMs", () => {
  it("reads ui.timing.splashSeconds", () => {
    const config = ConfigSchema.parse({
      ui: { timing: { splashSeconds: 2 } },
    });

    expect(getSplashDelayMs(config)).toBe(2000);
  });
});
