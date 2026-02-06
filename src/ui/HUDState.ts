import { buildHeatIndicatorState } from "./components/HeatIndicator";
import { buildProgressBarState } from "./components/ProgressBar";
import { buildHUDChipState } from "./components/HUDChip";
import { buildBottomActionBarState } from "./components/BottomActionBar";
import { buildButtonPrimaryState, buildButtonSecondaryState, buildButtonIconState } from "./components/Buttons";
import { TOKENS } from "./tokens";

export type HudSnapshotInput = {
  healthPercent: number;
  bloodPercent: number;
  heatLevel: number;
  heatMax: number;
  timeLabel: string;
};

export const buildHUDState = (input: HudSnapshotInput) => ({
  heat: buildHeatIndicatorState(input.heatLevel, input.heatMax),
  timeOfDay: buildHUDChipState("Time", input.timeLabel, { tone: "warning" }),
  healthBar: buildProgressBarState(input.healthPercent, { fillColor: TOKENS.colors.success }),
  bloodBar: buildProgressBarState(input.bloodPercent, { fillColor: TOKENS.colors.danger }),
  actionBar: buildBottomActionBarState(),
  actions: {
    bite: buildButtonPrimaryState("Bite"),
    escape: buildButtonSecondaryState("Escape"),
    hide: buildButtonSecondaryState("Hide"),
    pause: buildButtonIconState("||", {}, "Pause"),
  },
});
