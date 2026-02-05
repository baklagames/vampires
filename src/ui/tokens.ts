export interface ColorRoleTokens {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  danger: string;
  warning: string;
  success: string;
}

export interface SpacingTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface RadiusTokens {
  sm: number;
  md: number;
}

export interface TypographyTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
}

export interface Tokens {
  colors: ColorRoleTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  typography: TypographyTokens;
}

export const TOKENS: Tokens = {
  colors: {
    background: "#0b0b12",
    surface: "#1a1d2b",
    textPrimary: "#f5f5f7",
    textSecondary: "#b7bcc8",
    accent: "#6200ee",
    danger: "#e53935",
    warning: "#ffd54f",
    success: "#4caf50",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    sm: 8,
    md: 12,
  },
  typography: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
  },
};

export const getTokens = (): Tokens => TOKENS;
