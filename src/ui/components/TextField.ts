import { TOKENS } from "../tokens";

export type TextFieldState = {
  label: string;
  value: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  valid: boolean;
  disabled: boolean;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  radius: number;
  height: number;
  paddingX: number;
  fontSize: number;
};

export type TextFieldOptions = {
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  valid?: boolean;
  disabled?: boolean;
};

export const buildTextFieldState = (
  label: string,
  value: string,
  options: TextFieldOptions = {},
): TextFieldState => {
  const valid = options.valid ?? true;
  const disabled = options.disabled ?? false;
  const showError = Boolean(options.errorText) && !valid;

  return {
    label,
    value,
    placeholder: options.placeholder,
    helperText: options.helperText,
    errorText: options.errorText,
    valid,
    disabled,
    backgroundColor: TOKENS.colors.surface,
    textColor: TOKENS.colors.textPrimary,
    borderColor: showError ? TOKENS.colors.danger : TOKENS.colors.textSecondary,
    radius: TOKENS.radius.sm,
    height: TOKENS.spacing.xl,
    paddingX: TOKENS.spacing.md,
    fontSize: TOKENS.typography.sm,
  };
};
