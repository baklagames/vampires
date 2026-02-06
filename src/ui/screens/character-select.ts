import type { GameConfig } from "../../config/schema";
import { buildButtonIconState, buildButtonPrimaryState } from "../components/Buttons";
import { buildHUDChipState } from "../components/HUDChip";
import { buildListItemState } from "../components/ListItem";
import { buildTextFieldState } from "../components/TextField";
import { TOKENS } from "../tokens";

export type CharacterCard = {
  id: string;
  name: string;
  locked: boolean;
  traits: ReturnType<typeof buildListItemState>;
};

export type CharacterSelectState = {
  title: string;
  subtitle: string;
  cards: CharacterCard[];
  nameField: ReturnType<typeof buildTextFieldState>;
  randomizeButton: ReturnType<typeof buildButtonIconState>;
  continueButton: ReturnType<typeof buildButtonPrimaryState>;
  helperChips: Array<ReturnType<typeof buildHUDChipState>>;
  accent: string;
};

export const buildCharacterSelectState = (
  config: Readonly<GameConfig>,
  playerName: string,
): CharacterSelectState => {
  const cards: CharacterCard[] = [
    { id: "v1", name: "Nyx", locked: false, traits: buildListItemState("Shadow", { description: "Fast & quiet" }) },
    { id: "v2", name: "Vale", locked: false, traits: buildListItemState("Night", { description: "Balanced" }) },
    { id: "v3", name: "Ere", locked: true, traits: buildListItemState("Locked", { description: "Unlock later" }) },
    { id: "v4", name: "Mara", locked: true, traits: buildListItemState("Locked", { description: "Unlock later" }) },
    { id: "v5", name: "Sol", locked: true, traits: buildListItemState("Locked", { description: "Unlock later" }) },
    { id: "v6", name: "Kade", locked: true, traits: buildListItemState("Locked", { description: "Unlock later" }) },
  ];

  const nameRegex = new RegExp(config.player.name.manualInput.regex);
  const valid = nameRegex.test(playerName.trim());

  return {
    title: "Choose Your Vampire",
    subtitle: "Pick your hunter and name",
    cards,
    nameField: buildTextFieldState("Name", playerName, {
      helperText: "3-12 chars",
      valid,
      errorText: valid ? undefined : "Invalid name",
    }),
    randomizeButton: buildButtonIconState("?", {}, "Randomize"),
    continueButton: buildButtonPrimaryState("Continue", { disabled: !valid }),
    helperChips: [
      buildHUDChipState("Slots", "2/6"),
      buildHUDChipState("Unlocked", "2", { tone: "success" }),
    ],
    accent: TOKENS.colors.accent,
  };
};
