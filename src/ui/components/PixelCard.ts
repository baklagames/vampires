import { TOKENS } from "../tokens";

export type PixelCardState = {
  title?: string;
  subtitle?: string;
  backgroundColor: string;
  borderColor: string;
  shadowColor: string;
  radius: number;
  paddingX: number;
  paddingY: number;
  gap: number;
};

export type PixelCardOptions = {
  title?: string;
  subtitle?: string;
};

export const buildPixelCardState = (options: PixelCardOptions = {}): PixelCardState => ({
  title: options.title,
  subtitle: options.subtitle,
  backgroundColor: TOKENS.colors.surface,
  borderColor: TOKENS.colors.textSecondary,
  shadowColor: TOKENS.colors.background,
  radius: TOKENS.radius.sm,
  paddingX: TOKENS.spacing.md,
  paddingY: TOKENS.spacing.sm,
  gap: TOKENS.spacing.xs,
});
