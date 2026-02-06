import type { GameConfig } from "../config/schema";

export const getSplashDelayMs = (config: Readonly<GameConfig>): number =>
  config.ui.timing.splashSeconds * 1000;
