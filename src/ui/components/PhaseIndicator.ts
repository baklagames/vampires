import type { DayPhase } from "../../controllers/day-night";
import { TOKENS } from "../tokens";

export type PhaseIndicatorState = {
  phase: DayPhase;
  label: string;
  color: string;
};

const PHASE_LABELS: Record<DayPhase, string> = {
  day: "Day",
  dusk: "Dusk",
  night: "Night",
  dawn: "Dawn",
};

const PHASE_COLORS: Record<DayPhase, string> = {
  day: TOKENS.colors.stealthActive,
  dusk: TOKENS.colors.sunWarning,
  night: TOKENS.colors.primary,
  dawn: TOKENS.colors.sunWarning,
};

export const getPhaseIndicatorState = (phase: DayPhase): PhaseIndicatorState => ({
  phase,
  label: PHASE_LABELS[phase],
  color: PHASE_COLORS[phase],
});
