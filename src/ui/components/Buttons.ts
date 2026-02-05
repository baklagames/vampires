import { TOKENS } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonState = {
  label?: string;
  icon?: string;
  variant: ButtonVariant;
  size: ButtonSize;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  radius: number;
  height: number;
  paddingX: number;
  fontSize: number;
  iconSize: number;
  disabled: boolean;
};

export type ButtonOptions = {
  size?: ButtonSize;
  disabled?: boolean;
};

const BUTTON_SIZES: Record<ButtonSize, Omit<ButtonState, "variant" | "backgroundColor" | "textColor" | "borderColor" | "radius" | "disabled" | "label" | "icon">> =
  {
    sm: {
      size: "sm",
      height: TOKENS.spacing.lg,
      paddingX: TOKENS.spacing.sm,
      fontSize: TOKENS.typography.xs,
      iconSize: TOKENS.typography.sm,
    },
    md: {
      size: "md",
      height: TOKENS.spacing.xl,
      paddingX: TOKENS.spacing.md,
      fontSize: TOKENS.typography.sm,
      iconSize: TOKENS.typography.md,
    },
    lg: {
      size: "lg",
      height: TOKENS.spacing.xl + TOKENS.spacing.sm,
      paddingX: TOKENS.spacing.lg,
      fontSize: TOKENS.typography.md,
      iconSize: TOKENS.typography.lg,
    },
  };

const resolveVariantColors = (variant: ButtonVariant): Pick<ButtonState, "backgroundColor" | "textColor" | "borderColor"> => {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: TOKENS.colors.accent,
        textColor: TOKENS.colors.textPrimary,
        borderColor: TOKENS.colors.accent,
      };
    case "secondary":
      return {
        backgroundColor: TOKENS.colors.surface,
        textColor: TOKENS.colors.textPrimary,
        borderColor: TOKENS.colors.accent,
      };
    case "icon":
      return {
        backgroundColor: TOKENS.colors.surface,
        textColor: TOKENS.colors.accent,
        borderColor: TOKENS.colors.surface,
      };
  }
};

const buildButtonState = (
  variant: ButtonVariant,
  options: ButtonOptions = {},
  content: { label?: string; icon?: string } = {},
): ButtonState => {
  const size = options.size ?? "md";
  const disabled = options.disabled ?? false;
  const sizeProps = BUTTON_SIZES[size];
  const colors = resolveVariantColors(variant);

  return {
    variant,
    size,
    label: content.label,
    icon: content.icon,
    backgroundColor: colors.backgroundColor,
    textColor: colors.textColor,
    borderColor: colors.borderColor,
    radius: TOKENS.radius.md,
    height: sizeProps.height,
    paddingX: sizeProps.paddingX,
    fontSize: sizeProps.fontSize,
    iconSize: sizeProps.iconSize,
    disabled,
  };
};

export const buildButtonPrimaryState = (label: string, options: ButtonOptions = {}): ButtonState =>
  buildButtonState("primary", options, { label });

export const buildButtonSecondaryState = (label: string, options: ButtonOptions = {}): ButtonState =>
  buildButtonState("secondary", options, { label });

export const buildButtonIconState = (icon: string, options: ButtonOptions = {}, label?: string): ButtonState =>
  buildButtonState("icon", options, { icon, label });
