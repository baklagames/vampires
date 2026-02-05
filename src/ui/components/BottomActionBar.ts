import { TOKENS } from "../tokens";

export type BottomActionBarState = {
  height: number;
  paddingX: number;
  paddingY: number;
  backgroundColor: string;
  borderColor: string;
  radius: number;
  gap: number;
  zIndex: number;
  fixed: boolean;
};

export type BottomActionBarOptions = {
  height?: number;
  zIndex?: number;
};

export const buildBottomActionBarState = (
  options: BottomActionBarOptions = {},
): BottomActionBarState => ({
  height: options.height ?? TOKENS.spacing.xl + TOKENS.spacing.sm,
  paddingX: TOKENS.spacing.lg,
  paddingY: TOKENS.spacing.sm,
  backgroundColor: TOKENS.colors.surface,
  borderColor: TOKENS.colors.textSecondary,
  radius: TOKENS.radius.md,
  gap: TOKENS.spacing.sm,
  zIndex: options.zIndex ?? 10,
  fixed: true,
});
