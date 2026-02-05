import { TOKENS } from "../tokens";

export type MainMenuState = {
  title: string;
  actions: string[];
  accent: string;
};

export const buildMainMenuState = (): MainMenuState => ({
  title: "Main Menu",
  actions: ["Start", "Settings", "Quit"],
  accent: TOKENS.colors.primary,
});
