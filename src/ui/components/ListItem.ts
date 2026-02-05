import { TOKENS } from "../tokens";

export type ListItemState = {
  title: string;
  description?: string;
  icon?: string;
  accessory?: string;
  backgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
  borderColor: string;
  radius: number;
  paddingX: number;
  paddingY: number;
  gap: number;
  height: number;
  interactive: boolean;
};

export type ListItemOptions = {
  description?: string;
  icon?: string;
  accessory?: string;
  interactive?: boolean;
};

export const buildListItemState = (title: string, options: ListItemOptions = {}): ListItemState => ({
  title,
  description: options.description,
  icon: options.icon,
  accessory: options.accessory,
  backgroundColor: TOKENS.colors.surface,
  textColor: TOKENS.colors.textPrimary,
  secondaryTextColor: TOKENS.colors.textSecondary,
  borderColor: TOKENS.colors.surface,
  radius: TOKENS.radius.sm,
  paddingX: TOKENS.spacing.md,
  paddingY: TOKENS.spacing.sm,
  gap: TOKENS.spacing.sm,
  height: TOKENS.spacing.xl,
  interactive: options.interactive ?? true,
});
