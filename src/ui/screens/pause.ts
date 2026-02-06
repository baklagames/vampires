import { buildButtonPrimaryState, buildButtonSecondaryState } from "../components/Buttons";
import { buildListItemState } from "../components/ListItem";
import { buildModalSheetState } from "../components/ModalSheet";

export type PauseMenuState = {
  title: string;
  sheet: ReturnType<typeof buildModalSheetState>;
  actions: {
    resume: ReturnType<typeof buildButtonPrimaryState>;
    settings: ReturnType<typeof buildButtonSecondaryState>;
    returnToCastle: ReturnType<typeof buildButtonSecondaryState>;
    quit: ReturnType<typeof buildButtonSecondaryState>;
  };
  items: Array<ReturnType<typeof buildListItemState>>;
};

export const buildPauseMenuState = (): PauseMenuState => ({
  title: "Paused",
  sheet: buildModalSheetState({ open: true, title: "Pause" }),
  actions: {
    resume: buildButtonPrimaryState("Resume"),
    settings: buildButtonSecondaryState("Settings"),
    returnToCastle: buildButtonSecondaryState("Return to Castle"),
    quit: buildButtonSecondaryState("Quit"),
  },
  items: [
    buildListItemState("Resume", { accessory: ">" }),
    buildListItemState("Settings", { accessory: ">" }),
    buildListItemState("Return to Castle", { accessory: ">" }),
    buildListItemState("Quit", { accessory: ">" }),
  ],
});
