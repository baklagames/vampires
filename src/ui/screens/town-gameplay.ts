import { buildBottomActionBarState } from "../components/BottomActionBar";
import { buildButtonIconState, buildButtonPrimaryState, buildButtonSecondaryState } from "../components/Buttons";
import { buildHeatIndicatorState } from "../components/HeatIndicator";
import { buildProgressBarState } from "../components/ProgressBar";
import { buildHUDChipState } from "../components/HUDChip";
import { TOKENS } from "../tokens";

export type TownGameplayState = {
  title: string;
  heat: ReturnType<typeof buildHeatIndicatorState>;
  timeOfDay: ReturnType<typeof buildHUDChipState>;
  healthBar: ReturnType<typeof buildProgressBarState>;
  bloodBar: ReturnType<typeof buildProgressBarState>;
  actionBar: ReturnType<typeof buildBottomActionBarState>;
  actions: {
    bite: ReturnType<typeof buildButtonPrimaryState>;
    escape: ReturnType<typeof buildButtonSecondaryState>;
    hide: ReturnType<typeof buildButtonSecondaryState>;
    pause: ReturnType<typeof buildButtonIconState>;
    exitInterior?: ReturnType<typeof buildButtonSecondaryState>;
  };
  accent: string;
};

export const buildTownGameplayState = (): TownGameplayState => ({
  title: "Town",
  heat: buildHeatIndicatorState(2, 6),
  timeOfDay: buildHUDChipState("Night", "02:40", { tone: "warning" }),
  healthBar: buildProgressBarState(0.8),
  bloodBar: buildProgressBarState(0.6, { fillColor: TOKENS.colors.danger }),
  actionBar: buildBottomActionBarState(),
  actions: {
    bite: buildButtonPrimaryState("Bite"),
    escape: buildButtonSecondaryState("Escape"),
    hide: buildButtonSecondaryState("Hide"),
    pause: buildButtonIconState("||", {}, "Pause"),
  },
  accent: TOKENS.colors.accent,
});

export const buildInteriorGameplayState = (): TownGameplayState => {
  const base = buildTownGameplayState();
  return {
    ...base,
    title: "Interior",
    actions: {
      ...base.actions,
      exitInterior: buildButtonSecondaryState("Exit"),
    },
  };
};
