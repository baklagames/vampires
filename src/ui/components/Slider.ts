import { TOKENS } from "../tokens";

export type SliderState = {
  label?: string;
  min: number;
  max: number;
  value: number;
  step: number;
  disabled: boolean;
  trackColor: string;
  fillColor: string;
  thumbColor: string;
  height: number;
  thumbSize: number;
};

export type SliderOptions = {
  label?: string;
  step?: number;
  disabled?: boolean;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const buildSliderState = (
  min: number,
  max: number,
  value: number,
  options: SliderOptions = {},
): SliderState => {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) && max > safeMin ? max : safeMin + 1;
  const safeValue = clamp(value, safeMin, safeMax);
  const disabled = options.disabled ?? false;

  return {
    label: options.label,
    min: safeMin,
    max: safeMax,
    value: safeValue,
    step: options.step ?? 1,
    disabled,
    trackColor: TOKENS.colors.textSecondary,
    fillColor: TOKENS.colors.accent,
    thumbColor: TOKENS.colors.textPrimary,
    height: TOKENS.spacing.xs,
    thumbSize: TOKENS.spacing.md,
  };
};
