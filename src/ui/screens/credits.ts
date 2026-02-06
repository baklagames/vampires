import { buildButtonSecondaryState } from "../components/Buttons";
import { buildPixelCardState } from "../components/PixelCard";
import { TOKENS } from "../tokens";

export type CreditsState = {
  title: string;
  card: ReturnType<typeof buildPixelCardState>;
  backButton: ReturnType<typeof buildButtonSecondaryState>;
  accent: string;
};

export const buildCreditsState = (): CreditsState => ({
  title: "Credits",
  card: buildPixelCardState({ title: "Vampires Prototype", subtitle: "Built for MVP" }),
  backButton: buildButtonSecondaryState("Back"),
  accent: TOKENS.colors.accent,
});
