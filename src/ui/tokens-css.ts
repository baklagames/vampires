import { TOKENS, type Tokens } from "./tokens";

const toPx = (value: number): string => `${value}px`;

export const buildTokenCssVars = (tokens: Tokens): Record<string, string> => ({
  "--ds-color-background": tokens.colors.background,
  "--ds-color-surface": tokens.colors.surface,
  "--ds-color-text-primary": tokens.colors.textPrimary,
  "--ds-color-text-secondary": tokens.colors.textSecondary,
  "--ds-color-accent": tokens.colors.accent,
  "--ds-color-danger": tokens.colors.danger,
  "--ds-color-warning": tokens.colors.warning,
  "--ds-color-success": tokens.colors.success,
  "--ds-space-xs": toPx(tokens.spacing.xs),
  "--ds-space-sm": toPx(tokens.spacing.sm),
  "--ds-space-md": toPx(tokens.spacing.md),
  "--ds-space-lg": toPx(tokens.spacing.lg),
  "--ds-space-xl": toPx(tokens.spacing.xl),
  "--ds-radius-sm": toPx(tokens.radius.sm),
  "--ds-radius-md": toPx(tokens.radius.md),
  "--ds-type-xs": toPx(tokens.typography.xs),
  "--ds-type-sm": toPx(tokens.typography.sm),
  "--ds-type-md": toPx(tokens.typography.md),
  "--ds-type-lg": toPx(tokens.typography.lg),
});

export const applyTokensToCssVars = (
  tokens: Tokens = TOKENS,
  root: HTMLElement | null = typeof document === "undefined" ? null : document.documentElement,
): void => {
  if (!root) {
    return;
  }

  const vars = buildTokenCssVars(tokens);
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
};
