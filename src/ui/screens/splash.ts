import { TOKENS } from "../tokens";

export type SplashScreenState = {
  title: string;
  background: string;
  durationMs: number;
};

export const buildSplashState = (): SplashScreenState => ({
  title: "Vampires",
  background: TOKENS.colors.background,
  durationMs: 1200,
});
