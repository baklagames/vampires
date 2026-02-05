import { describe, expect, it } from "vitest";

import { createBackButtonHandler } from "../src/ui/back-button-handler";
import { NavigationController } from "../src/ui/navigation-controller";

describe("NavigationController", () => {
  it("pushes and pops screens in order", () => {
    const controller = new NavigationController({ initialScreen: "splash" });
    controller.push("main-menu");
    controller.push("settings");

    expect(controller.getCurrent()).toBe("settings");
    expect(controller.getStack()).toEqual(["splash", "main-menu", "settings"]);

    const popped = controller.pop();
    expect(popped).toBe("settings");
    expect(controller.getCurrent()).toBe("main-menu");
  });

  it("replaces the current screen", () => {
    const controller = new NavigationController({ initialScreen: "splash" });
    controller.replace("main-menu");

    expect(controller.getStack()).toEqual(["main-menu"]);
  });

  it("resets the stack", () => {
    const controller = new NavigationController({ initialScreen: "splash" });
    controller.push("main-menu");
    controller.reset("town");

    expect(controller.getStack()).toEqual(["town"]);
  });

  it("handles back button pops", () => {
    const controller = new NavigationController({ initialScreen: "splash" });
    controller.push("main-menu");
    const handler = createBackButtonHandler(controller);

    expect(handler.handle()).toBe(true);
    expect(controller.getCurrent()).toBe("splash");
  });
});
