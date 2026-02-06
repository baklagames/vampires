import { NavigationController, type ScreenId } from "./navigation-controller";
import { isTransitionAllowed } from "./navigation-routes";

export class NavigationFlow {
  private readonly controller: NavigationController;

  constructor(controller: NavigationController) {
    this.controller = controller;
  }

  navigate(to: ScreenId): boolean {
    const from = this.controller.getCurrent();
    if (!isTransitionAllowed(from, to)) {
      return false;
    }
    this.controller.push(to);
    return true;
  }

  reset(to: ScreenId): void {
    this.controller.reset(to);
  }
}
