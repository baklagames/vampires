import { TOKENS } from "../tokens";

export type HUDChipTone = "neutral" | "accent" | "warning" | "danger" | "success";

export type HUDChipState = {
  label: string;
  value?: string | number;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  radius: number;
  paddingX: number;
  paddingY: number;
  fontSize: number;
  gap: number;
};

export type HUDChipOptions = {
  tone?: HUDChipTone;
};

const toneTextColor = (tone: HUDChipTone): string => {
  switch (tone) {
    case "accent":
      return TOKENS.colors.accent;
    case "warning":
      return TOKENS.colors.warning;
    case "danger":
      return TOKENS.colors.danger;
    case "success":
      return TOKENS.colors.success;
    case "neutral":
    default:
      return TOKENS.colors.textPrimary;
  }
};

export const buildHUDChipState = (
  label: string,
  value?: string | number,
  options: HUDChipOptions = {},
): HUDChipState => {
  const tone = options.tone ?? "neutral";

  return {
    label,
    value,
    backgroundColor: TOKENS.colors.surface,
    textColor: toneTextColor(tone),
    borderColor: TOKENS.colors.surface,
    radius: TOKENS.radius.sm,
    paddingX: TOKENS.spacing.sm,
    paddingY: TOKENS.spacing.xs,
    fontSize: TOKENS.typography.xs,
    gap: TOKENS.spacing.xs,
  };
};
