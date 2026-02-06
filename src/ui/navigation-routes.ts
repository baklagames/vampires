import type { ScreenId } from "./navigation-controller";

export const SCREEN_FLOW: Record<ScreenId, ScreenId[]> = {
  splash: ["main-menu"],
  "main-menu": ["character-select", "settings", "credits", "component-gallery"],
  "character-select": ["castle"],
  castle: ["town", "upgrades"],
  upgrades: ["castle"],
  settings: ["main-menu"],
  pause: ["town", "settings", "castle", "main-menu"],
  death: ["castle"],
  credits: ["main-menu"],
  "component-gallery": ["main-menu"],
  town: ["interior", "pause", "death", "castle"],
  interior: ["town"],
  "game-over": ["castle"],
};

export const isTransitionAllowed = (from: ScreenId, to: ScreenId): boolean => {
  const allowed = SCREEN_FLOW[from] ?? [];
  return allowed.includes(to);
};
