import { buildBottomActionBarState } from "../components/BottomActionBar";
import { buildButtonIconState, buildButtonPrimaryState, buildButtonSecondaryState } from "../components/Buttons";
import { buildHeatIndicatorState } from "../components/HeatIndicator";
import { buildHUDChipState } from "../components/HUDChip";
import { buildListItemState } from "../components/ListItem";
import { buildModalSheetState } from "../components/ModalSheet";
import { buildPixelCardState } from "../components/PixelCard";
import { buildProgressBarState } from "../components/ProgressBar";
import { buildSliderState } from "../components/Slider";
import { buildTextFieldState } from "../components/TextField";
import { buildToggleSwitchState } from "../components/ToggleSwitch";
import { ToastQueue } from "../components/Toast";
import { TOKENS } from "../tokens";

export type ComponentGalleryState = {
  title: string;
  tokens: typeof TOKENS;
  buttons: {
    primary: ReturnType<typeof buildButtonPrimaryState>;
    secondary: ReturnType<typeof buildButtonSecondaryState>;
    icon: ReturnType<typeof buildButtonIconState>;
  };
  chips: {
    neutral: ReturnType<typeof buildHUDChipState>;
    warning: ReturnType<typeof buildHUDChipState>;
    danger: ReturnType<typeof buildHUDChipState>;
  };
  textFields: {
    valid: ReturnType<typeof buildTextFieldState>;
    invalid: ReturnType<typeof buildTextFieldState>;
    disabled: ReturnType<typeof buildTextFieldState>;
  };
  toggles: {
    on: ReturnType<typeof buildToggleSwitchState>;
    off: ReturnType<typeof buildToggleSwitchState>;
    disabled: ReturnType<typeof buildToggleSwitchState>;
  };
  sliders: {
    default: ReturnType<typeof buildSliderState>;
    disabled: ReturnType<typeof buildSliderState>;
  };
  progressBars: {
    half: ReturnType<typeof buildProgressBarState>;
    full: ReturnType<typeof buildProgressBarState>;
  };
  heatIndicators: {
    low: ReturnType<typeof buildHeatIndicatorState>;
    mid: ReturnType<typeof buildHeatIndicatorState>;
    high: ReturnType<typeof buildHeatIndicatorState>;
  };
  toast: ReturnType<ToastQueue["getState"]>;
  cards: {
    default: ReturnType<typeof buildPixelCardState>;
    titled: ReturnType<typeof buildPixelCardState>;
  };
  listItems: {
    basic: ReturnType<typeof buildListItemState>;
    withAccessory: ReturnType<typeof buildListItemState>;
  };
  modalSheet: ReturnType<typeof buildModalSheetState>;
  bottomActionBar: ReturnType<typeof buildBottomActionBarState>;
};

export const buildComponentGalleryState = (): ComponentGalleryState => {
  const toastQueue = new ToastQueue();
  toastQueue.enqueue("Settings saved", "success", { durationMs: 2000 }, 0);
  toastQueue.enqueue("Low blood", "warning", { durationMs: 2000 }, 100);

  return {
    title: "Component Gallery",
    tokens: TOKENS,
    buttons: {
      primary: buildButtonPrimaryState("Primary"),
      secondary: buildButtonSecondaryState("Secondary"),
      icon: buildButtonIconState("?", {}, "Help"),
    },
    chips: {
      neutral: buildHUDChipState("Heat", 2),
      warning: buildHUDChipState("Sun", "Warn", { tone: "warning" }),
      danger: buildHUDChipState("Alert", "High", { tone: "danger" }),
    },
    textFields: {
      valid: buildTextFieldState("Name", "Ada", { helperText: "3-12 chars" }),
      invalid: buildTextFieldState("Name", "?", {
        valid: false,
        errorText: "Invalid name",
      }),
      disabled: buildTextFieldState("Name", "Locked", { disabled: true }),
    },
    toggles: {
      on: buildToggleSwitchState(true, { label: "Sound" }),
      off: buildToggleSwitchState(false, { label: "Vibration" }),
      disabled: buildToggleSwitchState(false, { label: "Telemetry", disabled: true }),
    },
    sliders: {
      default: buildSliderState(0, 10, 4, { label: "Brightness", step: 1 }),
      disabled: buildSliderState(0, 100, 70, { label: "Volume", disabled: true }),
    },
    progressBars: {
      half: buildProgressBarState(0.5),
      full: buildProgressBarState(1),
    },
    heatIndicators: {
      low: buildHeatIndicatorState(1, 6),
      mid: buildHeatIndicatorState(3, 6),
      high: buildHeatIndicatorState(6, 6),
    },
    toast: toastQueue.getState(),
    cards: {
      default: buildPixelCardState(),
      titled: buildPixelCardState({ title: "Vampire", subtitle: "Shadow Walker" }),
    },
    listItems: {
      basic: buildListItemState("Start Game", { description: "Continue story" }),
      withAccessory: buildListItemState("Settings", { accessory: ">" }),
    },
    modalSheet: buildModalSheetState({ open: true, title: "Options" }),
    bottomActionBar: buildBottomActionBarState(),
  };
};
