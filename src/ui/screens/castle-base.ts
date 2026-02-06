import { buildBottomActionBarState } from "../components/BottomActionBar";
import { buildButtonPrimaryState, buildButtonSecondaryState } from "../components/Buttons";
import { buildProgressBarState } from "../components/ProgressBar";
import { buildPixelCardState } from "../components/PixelCard";
import { buildHUDChipState } from "../components/HUDChip";
import { TOKENS } from "../tokens";

export type CastleBaseState = {
  title: string;
  summaryCard: ReturnType<typeof buildPixelCardState>;
  healthBar: ReturnType<typeof buildProgressBarState>;
  bloodBar: ReturnType<typeof buildProgressBarState>;
  actionBar: ReturnType<typeof buildBottomActionBarState>;
  actions: {
    returnToTown: ReturnType<typeof buildButtonPrimaryState>;
    upgrades: ReturnType<typeof buildButtonSecondaryState>;
  };
  chips: Array<ReturnType<typeof buildHUDChipState>>;
  accent: string;
};

export const buildCastleBaseState = (): CastleBaseState => ({
  title: "Castle",
  summaryCard: buildPixelCardState({ title: "Coffin Hub", subtitle: "Rest and regroup" }),
  healthBar: buildProgressBarState(0.85),
  bloodBar: buildProgressBarState(0.55, { fillColor: TOKENS.colors.danger }),
  actionBar: buildBottomActionBarState(),
  actions: {
    returnToTown: buildButtonPrimaryState("Return to Town"),
    upgrades: buildButtonSecondaryState("Upgrades"),
  },
  chips: [buildHUDChipState("Heat", 2), buildHUDChipState("Night", "Soon", { tone: "warning" })],
  accent: TOKENS.colors.accent,
});
