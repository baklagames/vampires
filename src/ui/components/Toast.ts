import { TOKENS } from "../tokens";

export type ToastTone = "neutral" | "success" | "warning" | "danger";

export type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs: number;
  createdAtMs: number;
};

export type ToastState = {
  current: ToastItem | null;
  queue: ToastItem[];
  backgroundColor: string;
  textColor: string;
  radius: number;
  paddingX: number;
  paddingY: number;
};

export type ToastOptions = {
  durationMs?: number;
};

const toneBackground = (tone: ToastTone): string => {
  switch (tone) {
    case "success":
      return TOKENS.colors.success;
    case "warning":
      return TOKENS.colors.warning;
    case "danger":
      return TOKENS.colors.danger;
    case "neutral":
    default:
      return TOKENS.colors.surface;
  }
};

const toneText = (tone: ToastTone): string =>
  tone === "neutral" ? TOKENS.colors.textPrimary : TOKENS.colors.background;

const createToastItem = (message: string, tone: ToastTone, options: ToastOptions, nowMs: number): ToastItem => ({
  id: `${nowMs}-${Math.random().toString(16).slice(2, 8)}`,
  message,
  tone,
  durationMs: options.durationMs ?? 2500,
  createdAtMs: nowMs,
});

export class ToastQueue {
  private current: ToastItem | null = null;
  private queue: ToastItem[] = [];

  enqueue(message: string, tone: ToastTone = "neutral", options: ToastOptions = {}, nowMs = Date.now()): ToastItem {
    const item = createToastItem(message, tone, options, nowMs);
    if (!this.current) {
      this.current = item;
    } else {
      this.queue.push(item);
    }
    return item;
  }

  advance(nowMs = Date.now()): void {
    if (!this.current) {
      return;
    }
    const elapsed = nowMs - this.current.createdAtMs;
    if (elapsed >= this.current.durationMs) {
      this.current = this.queue.shift() ?? null;
    }
  }

  dismiss(): void {
    this.current = this.queue.shift() ?? null;
  }

  getState(): ToastState {
    const current = this.current;
    const tone = current?.tone ?? "neutral";

    return {
      current,
      queue: [...this.queue],
      backgroundColor: toneBackground(tone),
      textColor: toneText(tone),
      radius: TOKENS.radius.sm,
      paddingX: TOKENS.spacing.md,
      paddingY: TOKENS.spacing.sm,
    };
  }
}
