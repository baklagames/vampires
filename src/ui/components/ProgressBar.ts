import { TOKENS } from "../tokens";

export type ProgressBarState = {
  percent: number;
  width: number;
  height: number;
  radius: number;
  trackColor: string;
  fillColor: string;
};

export type ProgressBarOptions = {
  width?: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const buildProgressBarState = (
  percent: number,
  options: ProgressBarOptions = {},
): ProgressBarState => {
  const clamped = clamp(percent, 0, 1);

  return {
    percent: clamped,
    width: options.width ?? 140,
    height: options.height ?? TOKENS.spacing.sm,
    radius: TOKENS.radius.sm,
    trackColor: options.trackColor ?? TOKENS.colors.surface,
    fillColor: options.fillColor ?? TOKENS.colors.accent,
  };
};
