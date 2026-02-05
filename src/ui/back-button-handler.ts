import type { NavigationController } from "./navigation-controller";

export type BackButtonHandler = {
  handle: () => boolean;
};

export const createBackButtonHandler = (
  navigation: NavigationController,
): BackButtonHandler => ({
  handle: () => navigation.pop() !== null,
});
