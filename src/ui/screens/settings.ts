import type { GameConfig } from "../../config/schema";
import { TOKENS } from "../tokens";

export type SettingsState = {
  title: string;
  accent: string;
  playerNameValid: boolean;
};

const sanitizeName = (value: string): string => value.trim();

export const buildSettingsState = (
  config: Readonly<GameConfig>,
  playerName: string,
): SettingsState => {
  const sanitized = sanitizeName(playerName);
  const nameRegex = new RegExp(config.player.name.manualInput.regex);
  const playerNameValid = nameRegex.test(sanitized);

  return {
    title: "Settings",
    accent: TOKENS.colors.accent,
    playerNameValid,
  };
};
