import { TOKENS } from "../tokens";

export type HeatIndicatorState = {
  level: number;
  maxLevel: number;
  percent: number;
  color: string;
  label: string;
  radius: number;
  height: number;
};

export type HeatIndicatorOptions = {
  label?: string;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const heatColor = (percent: number): string => {
  if (percent >= 0.85) {
    return TOKENS.colors.danger;
  }
  if (percent >= 0.6) {
    return TOKENS.colors.warning;
  }
  if (percent >= 0.3) {
    return TOKENS.colors.accent;
  }
  return TOKENS.colors.success;
};

export const buildHeatIndicatorState = (
  level: number,
  maxLevel: number,
  options: HeatIndicatorOptions = {},
): HeatIndicatorState => {
  const safeMax = maxLevel > 0 ? maxLevel : 1;
  const clamped = clamp(level, 0, safeMax);
  const percent = clamped / safeMax;

  return {
    level: clamped,
    maxLevel: safeMax,
    percent,
    color: heatColor(percent),
    label: options.label ?? "Heat",
    radius: TOKENS.radius.sm,
    height: TOKENS.spacing.sm,
  };
};
