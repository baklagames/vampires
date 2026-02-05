import { TOKENS } from "../tokens";

export type SplashScreenState = {
  title: string;
  background: string;
  durationMs: number;
};

export const buildSplashState = (): SplashScreenState => ({
  title: "Vampires",
  background: TOKENS.colors.primary,
  durationMs: 1200,
});
