import { TOKENS } from "../tokens";

export type BloodBarState = {
  percent: number;
  color: string;
  width: number;
  height: number;
  radius: number;
};

export type BloodBarOptions = {
  width?: number;
  height?: number;
  cautionThreshold?: number;
  criticalThreshold?: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const getBloodBarState = (
  current: number,
  max: number,
  options: BloodBarOptions = {},
): BloodBarState => {
  const safeMax = max > 0 ? max : 1;
  const percent = clamp(current / safeMax, 0, 1);
  const cautionThreshold = options.cautionThreshold ?? 0.5;
  const criticalThreshold = options.criticalThreshold ?? 0.25;

  let color = TOKENS.colors.success;
  if (percent <= criticalThreshold) {
    color = TOKENS.colors.danger;
  } else if (percent <= cautionThreshold) {
    color = TOKENS.colors.warning;
  }

  return {
    percent,
    color,
    width: options.width ?? 120,
    height: options.height ?? 12,
    radius: TOKENS.radius.sm,
  };
};
