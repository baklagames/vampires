import { TOKENS } from "../tokens";

export type ModalSheetState = {
  open: boolean;
  title?: string;
  backgroundColor: string;
  textColor: string;
  radius: number;
  paddingX: number;
  paddingY: number;
  width: number;
  maxHeight: number;
  backdropColor: string;
  backdropAlpha: number;
  animationMs: number;
  zIndex: number;
};

export type ModalSheetOptions = {
  open?: boolean;
  title?: string;
  width?: number;
  maxHeight?: number;
  animationMs?: number;
  zIndex?: number;
};

export const buildModalSheetState = (options: ModalSheetOptions = {}): ModalSheetState => ({
  open: options.open ?? false,
  title: options.title,
  backgroundColor: TOKENS.colors.surface,
  textColor: TOKENS.colors.textPrimary,
  radius: TOKENS.radius.md,
  paddingX: TOKENS.spacing.lg,
  paddingY: TOKENS.spacing.md,
  width: options.width ?? TOKENS.spacing.xl * 12,
  maxHeight: options.maxHeight ?? TOKENS.spacing.xl * 18,
  backdropColor: TOKENS.colors.background,
  backdropAlpha: 0.6,
  animationMs: options.animationMs ?? 220,
  zIndex: options.zIndex ?? 20,
});
