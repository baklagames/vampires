import { describe, expect, it } from "vitest";

import { NavigationController } from "../src/ui/navigation-controller";
import { NavigationFlow } from "../src/ui/navigation-flow";

describe("NavigationFlow", () => {
  it("prevents invalid transitions", () => {
    const controller = new NavigationController({ initialScreen: "main-menu" });
    const flow = new NavigationFlow(controller);

    expect(flow.navigate("town")).toBe(false);
    expect(controller.getCurrent()).toBe("main-menu");
  });

  it("allows valid transitions", () => {
    const controller = new NavigationController({ initialScreen: "splash" });
    const flow = new NavigationFlow(controller);

    expect(flow.navigate("main-menu")).toBe(true);
    expect(flow.navigate("character-select")).toBe(true);
    expect(flow.navigate("castle")).toBe(true);
    expect(controller.getCurrent()).toBe("castle");
  });
});
