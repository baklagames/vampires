export type ScreenId =
  | "splash"
  | "main-menu"
  | "settings"
  | "town"
  | "interior"
  | "castle"
  | "game-over";

export type ScreenTransition = {
  from: ScreenId | null;
  to: ScreenId;
  stack: ScreenId[];
};

export type NavigationControllerOptions = {
  initialScreen: ScreenId;
  onTransition?: (transition: ScreenTransition) => void;
};

export class NavigationController {
  private stack: ScreenId[];
  private onTransition?: (transition: ScreenTransition) => void;

  constructor(options: NavigationControllerOptions) {
    this.stack = [options.initialScreen];
    this.onTransition = options.onTransition;
  }

  getCurrent(): ScreenId {
    return this.stack[this.stack.length - 1] ?? "splash";
  }

  getStack(): ScreenId[] {
    return [...this.stack];
  }

  push(screen: ScreenId): void {
    const from = this.getCurrent();
    this.stack.push(screen);
    this.emitTransition(from, screen);
  }

  replace(screen: ScreenId): void {
    const from = this.getCurrent();
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] = screen;
    } else {
      this.stack = [screen];
    }
    this.emitTransition(from, screen);
  }

  pop(): ScreenId | null {
    if (this.stack.length <= 1) {
      return null;
    }

    const from = this.stack.pop() ?? null;
    const to = this.getCurrent();
    this.emitTransition(from, to);
    return from;
  }

  reset(screen: ScreenId): void {
    const from = this.getCurrent();
    this.stack = [screen];
    this.emitTransition(from, screen);
  }

  private emitTransition(from: ScreenId | null, to: ScreenId): void {
    this.onTransition?.({
      from,
      to,
      stack: this.getStack(),
    });
  }
}
