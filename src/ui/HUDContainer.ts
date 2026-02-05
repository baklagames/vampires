import { getBloodBarState } from "./components/BloodBar";
import { getPhaseIndicatorState } from "./components/PhaseIndicator";
import { TOKENS } from "./tokens";

export type HUDLayout = {
  padding: number;
  gap: number;
  width: number;
  height: number;
  bloodBar: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  phaseIndicator: {
    x: number;
    y: number;
  };
  actionBar: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type HUDState = {
  layout: HUDLayout;
  bloodBar: ReturnType<typeof getBloodBarState>;
  phase: ReturnType<typeof getPhaseIndicatorState>;
};

export type HUDContainerOptions = {
  screenWidth: number;
  screenHeight: number;
  actionBarHeight?: number;
};

export const buildHUDState = (
  playerHealth: { current: number; max: number },
  phase: Parameters<typeof getPhaseIndicatorState>[0],
  options: HUDContainerOptions,
): HUDState => {
  const padding = TOKENS.spacing.lg;
  const gap = TOKENS.spacing.sm;
  const actionBarHeight = options.actionBarHeight ?? 64;

  const bloodBar = getBloodBarState(playerHealth.current, playerHealth.max);
  const phaseIndicator = getPhaseIndicatorState(phase);

  const layout: HUDLayout = {
    padding,
    gap,
    width: options.screenWidth,
    height: options.screenHeight,
    bloodBar: {
      x: padding,
      y: padding,
      width: bloodBar.width,
      height: bloodBar.height,
    },
    phaseIndicator: {
      x: padding,
      y: padding + bloodBar.height + gap,
    },
    actionBar: {
      x: padding,
      y: options.screenHeight - actionBarHeight - padding,
      width: options.screenWidth - padding * 2,
      height: actionBarHeight,
    },
  };

  return {
    layout,
    bloodBar,
    phase: phaseIndicator,
  };
};
