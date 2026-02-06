import { buildButtonPrimaryState } from "../components/Buttons";
import { buildHUDChipState } from "../components/HUDChip";
import { buildPixelCardState } from "../components/PixelCard";
import { TOKENS } from "../tokens";

export type DeathScreenState = {
  title: string;
  card: ReturnType<typeof buildPixelCardState>;
  causeChip: ReturnType<typeof buildHUDChipState>;
  continueButton: ReturnType<typeof buildButtonPrimaryState>;
  accent: string;
};

export const buildDeathScreenState = (cause: "sun" | "police" | "unknown"): DeathScreenState => {
  const causeLabel =
    cause === "sun" ? "Sunlight" : cause === "police" ? "Police" : "Unknown";

  return {
    title: "You Died",
    card: buildPixelCardState({ title: "You Died", subtitle: "Return to Castle" }),
    causeChip: buildHUDChipState("Cause", causeLabel, { tone: "danger" }),
    continueButton: buildButtonPrimaryState("Continue"),
    accent: TOKENS.colors.danger,
  };
};
