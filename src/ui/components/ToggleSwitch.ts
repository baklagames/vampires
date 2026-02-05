import { TOKENS } from "../tokens";

export type ToggleSwitchState = {
  label?: string;
  on: boolean;
  disabled: boolean;
  trackColor: string;
  thumbColor: string;
  width: number;
  height: number;
  thumbSize: number;
};

export type ToggleSwitchOptions = {
  label?: string;
  disabled?: boolean;
};

export const buildToggleSwitchState = (on: boolean, options: ToggleSwitchOptions = {}): ToggleSwitchState => {
  const disabled = options.disabled ?? false;
  const trackColor = disabled
    ? TOKENS.colors.surface
    : on
      ? TOKENS.colors.accent
      : TOKENS.colors.textSecondary;

  return {
    label: options.label,
    on,
    disabled,
    trackColor,
    thumbColor: TOKENS.colors.textPrimary,
    width: TOKENS.spacing.xl + TOKENS.spacing.sm,
    height: TOKENS.spacing.sm + TOKENS.spacing.xs,
    thumbSize: TOKENS.spacing.sm,
  };
};
