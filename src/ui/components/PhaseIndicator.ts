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
  day: TOKENS.colors.success,
  dusk: TOKENS.colors.warning,
  night: TOKENS.colors.accent,
  dawn: TOKENS.colors.warning,
};

export const getPhaseIndicatorState = (phase: DayPhase): PhaseIndicatorState => ({
  phase,
  label: PHASE_LABELS[phase],
  color: PHASE_COLORS[phase],
});
