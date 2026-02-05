export interface ColorTokens {
  primary: string;
  sunDamage: string;
  panic: string;
  danger: string;
  stealthActive: string;
  sunWarning: string;
  titleText: string;
}

export interface SpacingTokens {
  sm: number;
  md: number;
  lg: number;
}

export interface RadiusTokens {
  default: number;
}

export interface TypographyTokens {
  sm: number;
  md: number;
  lg: number;
}

export interface Tokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  typography: TypographyTokens;
}

export const TOKENS: Tokens = {
  colors: {
    primary: "#6200ee",
    sunDamage: "#ffeb3b",
    panic: "#f44336",
    danger: "#e53935",
    stealthActive: "#4caf50",
    sunWarning: "#ffd54f",
    titleText: "#ffffff",
  },
  spacing: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  radius: {
    default: 4,
  },
  typography: {
    sm: 12,
    md: 14,
    lg: 18,
  },
};

export const getTokens = (): Tokens => TOKENS;
